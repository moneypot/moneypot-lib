import * as assert from 'assert';
import * as check from './check';
import { INFINITE_POINT, pointMultiply, pointSubtract, pointAdd, Point, Scalar, negatePoint } from './elliptic';
import {
  buffer32FromBigInt,
  bufferFromHex,
  bufferToBigInt as int,
  bufferToHex,
  concatBuffers as concat,
  curve,
  getE,
  getK,
  getK0,
  jacobi,
  mod,
  modInverse,
  standardGetEBIP340,
  isEven,
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
    return concat(buffer32FromBigInt(r), buffer32FromBigInt(s));
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

export function verifyBip340(pubkey: Point, message: Uint8Array, sig: Signature): boolean {
  if (!check.isValidPubkey(pubkey)) {
    throw new Error('invalid pubkey provided');
  }
  if (!check.isValidSignature(sig)) {
    throw new Error('invalid sig');
  }

  const m = message;
  const P = isEven(pubkey.y) ? pubkey : negatePoint(pubkey);
  const e = standardGetEBIP340(sig.r, P.x, m);
  const R = pointSubtract(pointMultiply(curve.g, sig.s), pointMultiply(P, e));

  if (R === INFINITE_POINT) {
    return false;
  } else if (!isEven(R.y)) {
    return false;
  } else if (R.x !== sig.r) {
    return false;
  } else {
    return true;
  }
}

export function verifyECDSA(pubkey: Point, message: Uint8Array, sig: Signature): boolean {
  if (!check.isValidPubkey(pubkey)) {
    throw new Error('invalid pubkey provided');
  }
  if (!check.isValidSignature(sig)) {
    throw new Error('invalid sig');
  }
  const m = message;
  const P = pubkey;

  const e = Scalar.fromBytes(m);

  if (e instanceof Error) {
    throw new Error('invalid e scalar');
  }
  const sInv = modInverse(sig.s, curve.n);
  const u1 = mod(e * sInv, curve.n);
  const u2 = mod(sig.r * sInv, curve.n);

  const S = pointAdd(pointMultiply(curve.g, u1), pointMultiply(P, u2));
  const V = mod(S.x, curve.n);

  if (S === INFINITE_POINT) {
    return false;
  }
  if (V === sig.r) {
    return true;
  } else {
    return false;
  }
}

// this is for ecdsa?! not schnorr ?!
export function ecdsaRecover(message: Uint8Array, sig: Signature, j: number): Point {
  // var sigObj = { r: signature.slice(0, 32), s: signature.slice(32, 64) }

  // var sigr = new BN(sigObj.r)
  // var sigs = new BN(sigObj.s)
  // if (sigr.cmp(ecparams.n) >= 0 || sigs.cmp(ecparams.n) >= 0) throw new Error(messages.ECDSA_SIGNATURE_PARSE_FAIL)
  if (!check.isValidSignature(sig)) {
    throw new Error('invalid sig');
  }

  if ((3 & j) !== j) {
    throw new Error('The recovery param is more than two bits');
  }

  let e = Scalar.fromBytes(message);
  if (e instanceof Error) {
    throw e;
  }

  let r = sig.r;

  // A set LSB signifies that the y-coordinate is odd
  var isYOdd = (j & 1) == 1;
  var isSecondKey = j >> 1;
  // if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey)
  //   throw new Error('Unable to find sencond key candinate');
  if (r >= curve.p % curve.n && isSecondKey) {
    throw new Error('Unable to find second key coordinate');
  }

  // 1.1. Let x = r + jn.
  const r2 = Point.fromX(r + (isSecondKey ? curve.n : BigInt(0)), isYOdd);
  if (r2 instanceof Error) {
    throw r2;
  }

  let rInv = modInverse(sig.r, curve.n);
  //var s1 = n.sub(e).mul(rInv).umod(n);
  let s1 = mod((curve.n - e) * rInv, curve.n);
  // var s2 = s.mul(rInv).umod(n);
  let s2 = mod(sig.s * rInv, curve.n);

  // 1.6.1 Compute Q = r^-1 (sR -  eG)
  //               Q = r^-1 (sR + -eG)
  // return this.g.mulAdd(s1, r, s2);
  return pointAdd(pointMultiply(curve.g, s1), pointMultiply(r2, s2));
}
