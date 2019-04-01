import * as assert from 'assert';
import { Point, pointAdd } from '.';
import * as check from './check';
import { INFINITE_POINT, pointEq, pointMultiply, pointSubtract } from './elliptic';
import {
  bufferFromBigInt,
  bufferFromHex,
  bufferToBigInt as int,
  bufferToHex,
  concatBuffers as concat,
  curve,
  getE,
  getK,
  getK0,
  jacobi,
} from './util';

// Schnorr Signatures
//
// https://github.com/sipa/bips/blob/bip-schnorr/bip-schnorr.mediawiki

export type Signature = {
  r: bigint; // i.e. R.x
  s: bigint;
};

export const Signature = {
  fromBytes(buf: Uint8Array): Signature | Error {
    if (buf.length !== 64) {
      return new Error('signature buf expected 64 bytes');
    }
    const r = int(buf.slice(0, 32));
    const s = int(buf.slice(32, 64));
    // TODO: checkSignature here or just let bad sigs fail in verify()?
    return { r, s };
  },
  fromHex(hex: string): Signature | Error {
    const buff = bufferFromHex(hex);
    if (buff instanceof Error) {
      return buff;
    }
    return Signature.fromBytes(buff);
  },
  toBytes({ r, s }: Signature): Uint8Array {
    return concat(bufferFromBigInt(r), bufferFromBigInt(s));
  },
  toHex(sig: Signature): string {
    return bufferToHex(Signature.toBytes(sig));
  },
};

export function sign(message: Uint8Array, privkey: bigint): Signature {
  if (!check.isValidPrivkey(privkey)) {
    throw new Error('tried to sign with invalid privkey');
  }
  const m = message;
  const d = privkey;

  const k0 = getK0(d, m);
  const R = pointMultiply(curve.g, k0);
  const k = getK(R, k0); // nonce
  const e = getE(R.x, Point.fromPrivKey(d), m); // challenge
  const s = (k + e * d) % curve.n;
  const sig = { r: R.x, s };

  if (!check.isValidSignature(sig)) {
    throw new Error('signing produced invalid sig?!');
  }
  return sig;
}

export function verify(pubkey: Point, message: Uint8Array, sig: Signature): boolean {
  if (!check.isValidPubkey(pubkey)) {
    throw new Error('invalid pubkey provided');
  }
  if (!check.isValidSignature(sig)) {
    throw new Error('invalid sig');
  }

  const m = message;
  const P = pubkey;

  const e = getE(sig.r, P, m);
  const R = pointSubtract(pointMultiply(curve.g, sig.s), pointMultiply(P, e));

  if (R === INFINITE_POINT) {
    return false;
  } else if (jacobi(R.y) !== BigInt(1)) {
    return false;
  } else if (R.x !== sig.r) {
    return false;
  } else {
    return true;
  }
}
