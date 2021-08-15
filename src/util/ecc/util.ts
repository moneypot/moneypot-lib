import assert from '../assert';
import { Point, Scalar } from './elliptic';
import sha256 from '../bcrypto/sha256';
import { isValidPubkey } from './check';
import { fromString } from '../buffutils';

// secp256k1 parameters
export const curve = {
  a: BigInt(0),
  b: BigInt(7),
  p: BigInt('115792089237316195423570985008687907853269984665640564039457584007908834671663'), // 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn
  g: {
    x: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'), // 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
    y: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'), // 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n
  },
  // order
  n: BigInt('115792089237316195423570985008687907852837564279074904382605163141518161494337'), // 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n,
};

// Handles negative quotients.
//
//      -34 % 23 === -11
//      mod(-34, 23) === 12
export function mod(a: bigint, b: bigint): bigint {
  return ((a % b) + b) % b;
}

// pows then mods, but uses intermediate mods to keep intermediate number within bigint range
export function powmod(base: bigint, exp: bigint, m: bigint): bigint {
  if (exp === BigInt(0)) {
    return BigInt(1);
  }
  if (exp % BigInt(2) === BigInt(0)) {
    return mod(powmod(base, exp / BigInt(2), m) ** BigInt(2), m);
  } else {
    return mod(base * powmod(base, exp - BigInt(1), m), m);
  }
}

// a^-1 mod m
export function modInverse(a: bigint, m: bigint): bigint {
  if (a < 0 || m <= a) {
    a = mod(a, m);
  }

  let [c, d] = [a, m];
  let q = d / c;
  let [uc, vc, ud, vd] = [BigInt(1), BigInt(0), BigInt(0), BigInt(1)];

  while (c !== BigInt(0)) {
    [q, c, d] = [d / c, mod(d, c), c];
    [uc, vc, ud, vd] = [ud - q * uc, vd - q * vc, uc, vc];
  }

  // At this point, d is the GCD, and ud*a+vd*m = d.
  // If d == 1, this means that ud is a inverse.
  assert(d === BigInt(1));
  if (ud > 0) {
    return ud;
  } else {
    return ud + m;
  }
}

function bigIntSqrt(n: bigint): bigint {
  if (n < BigInt(0)) {
    throw new Error('cannot sqrt negative number');
  }

  if (n < BigInt(2)) {
    return n;
  }

  // tslint:disable-next-line: no-shadowed-variable
  function newtonIteration(n: bigint, x0: bigint): bigint {
    const x1 = (n / x0 + x0) >> BigInt(1);
    if (x0 === x1 || x0 === x1 - BigInt(1)) {
      return x0;
    }
    return newtonIteration(n, x1);
  }

  return newtonIteration(n, BigInt(1));
}

// copy-pasted, seems to be faster though time optimization is not really a priority

// // Pre-Init
// const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
// const LUT_HEX_8b = new Array(0x100);
// for (let n = 0; n < 0x100; n++) {
//   LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
// }
// // End Pre-Init
// export function bufferToHex(buffer: Uint8Array) {
//   let out = '';
//   for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
//     out += LUT_HEX_8b[buffer[idx]];
//   }
//   return out;
// }

export const bigintToHex = (n: number | bigint) => n.toString(16).padStart(64, '0');

export function bufferToHex(buf: Uint8Array): string {
  let result = '';

  for (const b of buf) {
    const value = b.toString(16);
    result += value.length === 1 ? '0' + value : value;
  }

  return result;
}

export function bufferFromHex(hex: string): Uint8Array | Error {
  if (hex.length % 2 === 1 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return new Error('invalid hex string');
  }
  return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => Number.parseInt(byte, 16)));
}

// export function bufferToBigInt(buf: Uint8Array): bigint {
//     return BigInt('0x' + bufferToHex(buf))
// }

export function bufferToBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  const n = bytes.length;

  // Read input in 8 byte slices
  if (n >= 8) {
    const view = new DataView(bytes.buffer, bytes.byteOffset);

    for (let i = 0, k = n & ~7; i < k; i += 8) {
      const x = view.getBigUint64(i, false);
      result = (result << BigInt(64)) + x;
    }
  }

  // Mop up any remaining bytes
  for (let i = n & ~7; i < n; i++) {
    result = result * BigInt(256) + BigInt(bytes[i]);
  }

  return result;
}

// Buffer is fixed-length 32bytes
export function buffer32FromBigInt(n: bigint): Uint8Array {
  const out = [];
  const base = BigInt(256);
  while (n >= base) {
    out.push(Number(n % base));
    n = n / base;
  }
  out.push(Number(n));

  if (out.length > 32) {
    throw new Error('bigint overflows 32 byte buffer');
  }

  const buf = new Uint8Array(32);
  buf.set(out.reverse(), 32 - out.length);
  return buf;
}

export function concatBuffers(...bufs: Uint8Array[]) {
  let totalSize = 0;
  for (const buf of bufs) {
    assert(buf instanceof Uint8Array);
    totalSize += buf.length;
  }

  const res = new Uint8Array(totalSize);
  let writeAt = 0;
  for (const buf of bufs) {
    res.set(buf, writeAt);
    writeAt += buf.length;
  }

  return res;
}

// 33 bytes: // first byte represents y, next 32 bytes are x coord
export function pointFromBuffer(buf: Uint8Array): Point | Error {
  if (buf.length !== 33) {
    return new Error('invalid point buffer');
  }

  if (![0x02, 0x03].includes(buf[0])) {
    return new Error('not compressed');
  }

  // odd is BigInt(1)  or BigInt(0)
  const odd = BigInt(buf[0] - 0x02);

  const x = bufferToBigInt(buf.slice(1, 33));

  return pointFromX(x, odd);
}

export function pointFromX(x: bigint, isOdd: bigint): Point | Error {
  if (isOdd !== BigInt(0) && isOdd !== BigInt(1)) {
    throw new Error('isOdd must be 0n or 1n');
  }

  const { p } = curve;
  const ysq = (powmod(x, BigInt(3), p) + BigInt(7)) % p;
  const y0 = powmod(ysq, (p + BigInt(1)) / BigInt(4), p);
  if (powmod(y0, BigInt(2), p) !== ysq) {
    return new Error('point not on curve');
  }
  const y = (y0 & BigInt(1)) !== isOdd ? p - y0 : y0;
  const point = { x, y };

  assert(isValidPubkey(point));

  return point;
}

export function pointToBuffer(point: Point): Uint8Array {
  // 0x02: y is even
  // 0x03: y is odd
  const b0 = point.y % BigInt(2) === BigInt(0) ? 0x02 : 0x03;

  const xbuf = buffer32FromBigInt(point.x);
  assert(xbuf.length === 32);

  const result = new Uint8Array(33);
  result.set([b0], 0);
  result.set(xbuf, 1);

  return result;
}

export function isEven(y: bigint) {
  return y % BigInt(2) === BigInt(0);
}

export function constantTimeBufferEquals(a: Uint8Array, b: Uint8Array): boolean {
  const aLen = a.length;
  const bLen = b.length;
  const len = Math.max(aLen, bLen);
  let result = 0;

  for (let i = 0; i < len; i++) {
    result |= a[i % aLen] ^ b[i % bLen];
  }

  result |= aLen ^ bLen;

  return result === 0;
}

export function utf8ToBuffer(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function isPointOnCurve({ x, y }: Point): boolean {
  const { p, a, b } = curve;
  return (y * y - (x * x * x + a * x + b)) % p === BigInt(0);
}

export function jacobi(y: bigint): bigint {
  return powmod(y, (curve.p - BigInt(1)) / BigInt(2), curve.p);
}

export function getK(R: Point, k0: bigint): bigint {
  return jacobi(R.y) === BigInt(1) ? k0 : curve.n - k0;
}

export function getK0(privkey: Scalar, message: Uint8Array): Scalar {
  const k0 = bufferToBigInt(sha256.digest(concatBuffers(buffer32FromBigInt(privkey), message))) % curve.n;
  if (k0 === BigInt(0)) {
    // We got incredibly unlucky
    throw new Error('k0 is zero');
  }
  return k0;
}

export function getE(Rx: bigint, P: Point, m: Uint8Array): bigint {
  return bufferToBigInt(sha256.digest(concatBuffers(buffer32FromBigInt(Rx), pointToBuffer(P), m))) % curve.n;
}

export function standardGetEBIP340(Rx: bigint, Px: bigint, m: Uint8Array) {
  const tag = sha256.digest(fromString('BIP0340/challenge'));
  return (
    bufferToBigInt(sha256.digest(concatBuffers(tag, tag, buffer32FromBigInt(Rx), buffer32FromBigInt(Px), m))) % curve.n
  );
}
