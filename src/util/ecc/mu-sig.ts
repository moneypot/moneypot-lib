import * as assert from '../assert';
import { INFINITE_POINT, Point, pointAdd, pointMultiply, Scalar } from '.';
import * as check from './check';
import sha256 from '../bcrypto/sha256';
import {
  bufferToBigInt,
  concatBuffers,
  curve,
  pointToBuffer,
  utf8ToBuffer,
  isEven,
  getE,
  buffer32FromBigInt,
  standardGetEBIP340,
} from './util';
import { scalarMultiply, scalarAdd, scalarNegate, pointSubtract, negatePoint } from './elliptic';
import { PrivateKey, PublicKey } from '../..';
import { Signature } from './signature';

// https://blockstream.com/2018/01/23/musig-key-aggregation-schnorr-signatures/

export function calculateL(pubkeys: Point[]): Uint8Array {
  return sha256.digest(concatBuffers(...pubkeys.map(pointToBuffer))); // the hash is made of 33 byte buffers. problem? Not sure.. probably unstandard by now at least for bip340 purposes
}

export function bipCalculateL(pubKeys: Uint8Array[]) {
  return sha256.digest(concatBuffers(...pubKeys));
}

export function pubkeyCombine(pubkeys: Point[]): Point {
  assert.equal(pubkeys.length > 0, true);

  const L = calculateL(pubkeys);
  let X = INFINITE_POINT;
  for (let i = 0; i < pubkeys.length; i++) {
    const Xi = pubkeys[i];
    const coefficient = calculateCoefficient(L, i);
    const summand = pointMultiply(Xi, coefficient);
    if (X === INFINITE_POINT) {
      X = summand;
    } else {
      X = pointAdd(X, summand);
    }
  }

  return X;
}

export function bipPubkeyCombine(pubkeys: Point[]): Point {
  assert.equal(pubkeys.length > 0, true);

  const L = bipCalculateL(pubkeys.map(pk => buffer32FromBigInt(pk.x)));
  let X = INFINITE_POINT;
  for (let i = 0; i < pubkeys.length; i++) {
    const Xi = pubkeys[i];
    const coefficient = calculateCoefficient(L, i);
    const summand = pointMultiply(Xi, coefficient);

    if (X === INFINITE_POINT) {
      X = summand;
    } else {
      X = pointAdd(X, summand);
    }
  }
  return X;
}

export function privkeyCombine(privkeys: Scalar[]): Scalar {
  assert.equal(privkeys.length > 0, true);
  check.privkeysAreUnique(privkeys);

  const Xs = [];
  let R = INFINITE_POINT;
  for (const privateKey of privkeys) {
    const Xi = Point.fromPrivKey(privateKey);
    Xs.push(Xi);
    if (R === INFINITE_POINT) {
      R = Xi;
    } else {
      R = pointAdd(R, Xi);
    }
  }

  const L = sha256.digest(concatBuffers(...Xs.map(pointToBuffer)));
  let X = BigInt(0);
  for (let i = 0; i < privkeys.length; i++) {
    const Xi = privkeys[i];
    const coefficient = calculateCoefficient(L, i);
    const summand = scalarMultiply(Xi, coefficient);
    if (X === BigInt(0)) {
      X = summand;
    } else {
      X = scalarAdd(X, summand);
    }
  }

  return X;
}

const MUSIG_TAG = sha256.digest(utf8ToBuffer('MuSig coefficient'));

export function calculateCoefficient(L: Uint8Array, idx: number): bigint {
  const ab = new ArrayBuffer(4);
  const view = new DataView(ab);
  view.setUint32(0, idx, true); // true for LE
  const idxBuf = new Uint8Array(ab);
  const data = sha256.digest(concatBuffers(MUSIG_TAG, MUSIG_TAG, L, idxBuf));
  return bufferToBigInt(data) % curve.n;
}

// TODO: Lazily copied from guggero. there are some conflicts with Y and determining parity that's currently a bit ugly
// TODO: add more constructive and definitive types

// from GUGGERO, we utilize three-round multisig from his library https://github.com/guggero/bip-schnorr
export function sessionInit(
  sessionID: Uint8Array,
  privateKey: PrivateKey,
  message: Uint8Array,
  pubKeyCombined: Uint8Array,
  pkParity: any,
  ell: Uint8Array,
  idx: number
) {
  // check variables
  const session = {
    sessionID,
    message,
    pubKeyCombined, // just the X-coordinate
    pkParity,
    ell,
    idx,
  };
  const coefficient = calculateCoefficient(ell, idx);
  let secretSessionKey = scalarMultiply(privateKey.scalar, coefficient) % curve.n;
  const ownKeyParity = isEven(privateKey.toPublicKey().y);
  if (ownKeyParity != pkParity) {
    secretSessionKey = scalarNegate(secretSessionKey);
  }

  const nonceData = concatBuffers(sessionID, message, session.pubKeyCombined, privateKey.buffer);
  const nonceHash = sha256.digest(nonceData);

  const privKeyNonce = PrivateKey.fromBytes(nonceHash);
  // this already checks
  if (privKeyNonce instanceof Error) {
    throw privKeyNonce;
  }
  const R = privKeyNonce.toPublicKey();

  const nonce = R.x;
  const nonceParity = isEven(R.y);

  const commitment = sha256.digest(buffer32FromBigInt(nonce));

  return { session, nonce, nonceParity, commitment, privKeyNonce, ownKeyParity, secretSessionKey };
}

// session is a complex object - are we doing stuff with even Y correct?
export function sessionNonceCombine(nonces: PublicKey[]) {
  check.isValidPubkey(nonces[0]);
  let R = nonces[0];
  for (let i = 1; i < nonces.length; i++) {
    check.isValidPubkey(nonces[i]);
    R = R.tweak(nonces[i]);
  }
  const combinedNonceParity = isEven(R.y);
  return { combinedNonceParity, R };
}

export function partialSign(
  message: Uint8Array,
  nonceCombined: PublicKey,
  pubKeyCombined: PublicKey,
  secretNonce: PrivateKey,
  secretKey: PrivateKey,
  nonceParity: boolean,
  combinedNonceParity: boolean
) {
  const e = getE(nonceCombined.x, pubKeyCombined, message);
  const sk = secretKey;
  let k = secretNonce;

  if (nonceParity !== combinedNonceParity) {
    k = new PrivateKey(scalarNegate(k.scalar));
  }
  return scalarAdd(scalarMultiply(sk.scalar, e), k.scalar);
}

export function partialSignbipPlusbipGetE(
  message: Uint8Array,
  nonceCombined: PublicKey,
  pubKeyCombined: PublicKey,
  secretNonce: PrivateKey,
  secretKey: PrivateKey,
  nonceParity: boolean,
  combinedNonceParity: boolean
) {
  const eBIP = standardGetEBIP340(nonceCombined.x, pubKeyCombined.x, message);
  const sk = secretKey;
  let k = secretNonce.scalar; // delete the type

  if (nonceParity !== combinedNonceParity) {
    k = scalarNegate(k);
  }
  return scalarAdd(scalarMultiply(sk.scalar, eBIP), k);
}

export function partialSigbipVerify(
  message: Uint8Array,
  pubKeyCombined: bigint,
  partialSig: bigint,
  nonceCombined: PublicKey,
  idx: number,
  pubKey: PublicKey,
  nonce: PublicKey,
  ell: Uint8Array,
  pkParity: boolean,
  combinedNonceParity: boolean
) {
  let e = standardGetEBIP340(nonceCombined.x, pubKeyCombined, message);
  const coefficient = calculateCoefficient(ell, idx);

  // if Y is odd, we need curve.n - P to get to curve P - Y, makes sense?
  if (!pkParity) {
    e = scalarNegate(e);
  }

  let RP = pointSubtract(pointMultiply(curve.g, partialSig), pointMultiply(pubKey, scalarMultiply(e, coefficient)));
  if (combinedNonceParity) {
    RP = negatePoint(RP);
  }

  const s = pointAdd(RP, nonce);
  if (s === INFINITE_POINT) {
    return true;
  } else {
    return false;
  }
}

// we can just check this normally

// this is all a bit ugly TODO
export function partialSigCombine(nonceCombined: PublicKey, partialSigs: bigint[]): Signature {
  // check.checkArray('partialSigs', partialSigs);
  let s = partialSigs[0];
  for (let i = 1; i < partialSigs.length; i++) {
    s = scalarAdd(s, partialSigs[i]);
  }

  return { r: nonceCombined.x, s: s } as Signature;
}
