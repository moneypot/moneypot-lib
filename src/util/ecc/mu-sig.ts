import * as assert from '../assert';
import { INFINITE_POINT, Point, pointAdd, pointMultiply, Scalar } from '.';
import * as check from './check';
import sha256 from '../bcrypto/sha256';
import { bufferToBigInt, concatBuffers, curve, pointToBuffer, utf8ToBuffer } from './util';
import { scalarMultiply, scalarAdd } from './elliptic';

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

function calculateCoefficient(L: Uint8Array, idx: number): bigint {
  const ab = new ArrayBuffer(4);
  const view = new DataView(ab);
  view.setUint32(0, idx, true); // true for LE
  const idxBuf = new Uint8Array(ab);
  const data = sha256.digest(concatBuffers(MUSIG_TAG, MUSIG_TAG, L, idxBuf));
  return bufferToBigInt(data) % curve.n;
}
