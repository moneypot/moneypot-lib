import * as assert from '../assert';
import { INFINITE_POINT, Point, pointAdd, pointMultiply, Scalar, Signature } from '.';
import * as check from './check';
import sha256 from '../bcrypto/sha256';
import { bufferToBigInt, concatBuffers, curve, getE, getK, getK0, pointToBuffer, utf8ToBuffer } from './util';

// https://blockstream.com/2018/01/23/musig-key-aggregation-schnorr-signatures/

function calculateL(pubkeys: Point[]): Uint8Array {
  return sha256.digest(concatBuffers(...pubkeys.map(pointToBuffer)));
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

const MUSIG_TAG = sha256.digest(utf8ToBuffer('MuSig coefficient'));

function calculateCoefficient(L: Uint8Array, idx: number): bigint {
  const ab = new ArrayBuffer(4);
  const view = new DataView(ab);
  view.setUint32(0, idx, true); // true for LE
  const idxBuf = new Uint8Array(ab);
  const data = sha256.digest(concatBuffers(MUSIG_TAG, MUSIG_TAG, L, idxBuf));
  return bufferToBigInt(data) % curve.n;
}

// Non-interactive: We must know all signer private keys.
export function signNoninteractively(privkeys: Scalar[], message: Uint8Array): Signature {
  assert.equal(privkeys.length > 0, true);
  check.privkeysAreUnique(privkeys);

  const rs = [];
  const Xs = [];
  let R = INFINITE_POINT;
  for (const privateKey of privkeys) {
    const ri = getK0(privateKey, message);
    const Ri = pointMultiply(curve.g, ri);
    const Xi = Point.fromPrivKey(privateKey);
    rs.push(ri);
    Xs.push(Xi);
    if (R === INFINITE_POINT) {
      R = Ri;
    } else {
      R = pointAdd(R, Ri);
    }
  }

  const L = sha256.digest(concatBuffers(...Xs.map(pointToBuffer)));
  const coefficients = [];
  let X = INFINITE_POINT;
  for (let i = 0; i < Xs.length; i++) {
    const Xi = Xs[i];
    const coefficient = calculateCoefficient(L, i);
    const summand = pointMultiply(Xi, coefficient);
    coefficients.push(coefficient);
    if (X === INFINITE_POINT) {
      X = summand;
    } else {
      X = pointAdd(X, summand);
    }
  }

  const e = getE(R.x, X, message);
  let s = BigInt(0);
  for (let i = 0; i < rs.length; i++) {
    const ri = getK(R, rs[i]);
    s = (s + (ri + ((e * coefficients[i] * privkeys[i]) % curve.n))) % curve.n;
  }

  const sig = { r: R.x, s };
  if (!check.isValidSignature(sig)) {
    throw new Error('somehow created an invalid sig');
  }

  return sig;
}
