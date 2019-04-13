import * as check from './check';
import {
  buffer32FromBigInt,
  bufferFromHex,
  bufferToBigInt,
  bufferToHex,
  curve,
  mod,
  modInverse,
  pointFromBuffer,
  pointToBuffer,
  powmod,
} from './util';

export type Scalar = bigint;

export const Scalar = {
  fromBytes(buf: Uint8Array): Scalar | Error {
    const priv = bufferToBigInt(buf);
    if (!check.isValidPrivkey(priv)) {
      return new Error('scalar was not valid private key');
    }
    return priv;
  },
  fromHex(hex: string): Scalar | Error {
    const buff = bufferFromHex(hex);
    if (buff instanceof Error) {
      return buff;
    }
    const priv = bufferToBigInt(buff);
    if (!check.isValidPrivkey(priv)) {
      return new Error('scalar was not valid private key');
    }
    return priv;
  },
  toBytes(n: Scalar): Uint8Array {
    return buffer32FromBigInt(n);
  },
  toHex(n: Scalar): string {
    return bufferToHex(buffer32FromBigInt(n));
  },
};

export interface Point {
  readonly x: bigint;
  readonly y: bigint;
}

export const Point = {
  fromPrivKey(privkey: Scalar): Point {
    if (!check.isValidPrivkey(privkey)) {
      throw new Error('scalar was not valid private key');
    }
    return pointMultiply(curve.g, privkey);
  },
  fromBytes(buf: Uint8Array): Point | Error {
    return pointFromBuffer(buf);
  },
  fromHex(hex: string): Point | Error {
    const buff = bufferFromHex(hex);
    if (buff instanceof Error) {
      throw buff;
    }
    return Point.fromBytes(buff);
  },
  toHex(point: Point): string {
    return bufferToHex(pointToBuffer(point));
  },
  toBytes(point: Point): Uint8Array {
    return pointToBuffer(point);
  },
};

export const INFINITE_POINT: Point = new class {
  get x(): bigint {
    throw new Error("infinite point doesn't have an x");
  }

  get y(): bigint {
    throw new Error("infinite point doesn't have a y");
  }
}();

// SCALAR MATH

export function scalarAdd(a: Scalar, b: Scalar): Scalar {
  return (a + b) % curve.n;
}

export function scalarMultiply(a: Scalar, b: Scalar): Scalar {
  return (a * b) % curve.n;
}

export function scalarNegate(a: Scalar): Scalar {
  return (curve.n - a) % curve.n;
}

// scalar^-1 mod N
export function scalarInverse(a: Scalar): Scalar {
  return modInverse(a, curve.n);
}

// POINT MATH
//
// TODO: Should point functions propagate INFINITY_POINT
// instead of failing on x/y access so that callsite can perceive INFINITY_POINT?

export function pointEq(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function pointAdd(...points: Point[]): Point {
  check.check(points.length > 1, 'can only add 1 or more points');
  let point = points[0];
  for (let i = 1; i < points.length; i++) {
    point = fastAdd(point, points[i]);
  }
  return point;
}

export function pointSubtract(a: Point, b: Point): Point {
  b = { x: b.x, y: (curve.p - b.y) % curve.p };
  return pointAdd(a, b);
}

export function pointMultiply(point: Point, scalar: bigint): Point {
  scalar = scalar % curve.n;
  return fastMultiply(point, scalar);
}

// NAIVE IMPL

function naiveAdd(a: Point, b: Point): Point {
  if (a === INFINITE_POINT) {
    return b;
  }
  if (b === INFINITE_POINT) {
    return a;
  }
  if (a.x === b.x && a.y !== b.y) {
    return INFINITE_POINT;
  }
  const lam =
    a.x === b.x && a.y === b.y
      ? ((BigInt(3) * a.x * a.x + curve.a) * powmod(BigInt(2) * a.y, curve.p - BigInt(2), curve.p)) % curve.p
      : ((b.y - a.y) * powmod(b.x - a.x, curve.p - BigInt(2), curve.p)) % curve.p;
  const x3 = (lam * lam - a.x - b.x) % curve.p;
  const y = mod(lam * (a.x - x3) - a.y, curve.p);
  return { x: x3, y };
}

export function naiveMultiply(point: Point, scalar: bigint): Point {
  scalar = scalar % curve.n;
  let r = INFINITE_POINT;
  for (let i = BigInt(0); i < BigInt(256); i++) {
    if ((scalar >> i) & BigInt(1)) {
      r = naiveAdd(r, point);
    }
    point = naiveAdd(point, point);
  }
  return r;
}

// JACOBIAN OPTIMIZATION

type Jacobian = [bigint, bigint, bigint];

// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
function inv(a: bigint, n: bigint): bigint {
  if (a === BigInt(0)) {
    return BigInt(0);
  }
  let [lm, hm, low, high] = [BigInt(1), BigInt(0), mod(a, n), n];
  while (low > 1) {
    const r = high / low;
    const [nm, _new] = [hm - lm * r, high - low * r];
    [lm, low, hm, high] = [nm, _new, lm, low];
  }
  return lm % n;
}

function fromJacobian(j: Jacobian): Point {
  if (j[0] === BigInt(0) && j[1] === BigInt(0)) {
    return INFINITE_POINT;
  }
  const z = inv(j[2], curve.p);
  const x = (j[0] * z ** BigInt(2)) % curve.p;
  const y = mod(j[1] * z ** BigInt(3), curve.p);
  return { x, y };
}

function toJacobian(point: Point): Jacobian {
  return [point.x, point.y, BigInt(1)];
}

function jacobianDouble(p: Jacobian): Jacobian {
  if (p[1] === BigInt(0)) {
    return [BigInt(0), BigInt(0), BigInt(0)];
  }
  const ysq = p[1] ** BigInt(2) % curve.p;
  const S = (BigInt(4) * p[0] * ysq) % curve.p;
  const M = (BigInt(3) * p[0] ** BigInt(2) + curve.a * p[2] ** BigInt(4)) % curve.p;
  const nx = (M ** BigInt(2) - BigInt(2) * S) % curve.p;
  const ny = (M * (S - nx) - BigInt(8) * ysq ** BigInt(2)) % curve.p;
  const nz = (BigInt(2) * p[1] * p[2]) % curve.p;
  return [nx, ny, nz];
}

function jacobianAdd(p: Jacobian, q: Jacobian): Jacobian {
  const P = curve.p;

  if (p[1] === BigInt(0)) {
    return q;
  }
  if (q[1] === BigInt(0)) {
    return p;
  }
  const U1 = (p[0] * q[2] ** BigInt(2)) % P;
  const U2 = (q[0] * p[2] ** BigInt(2)) % P;
  const S1 = (p[1] * q[2] ** BigInt(3)) % P;
  const S2 = (q[1] * p[2] ** BigInt(3)) % P;
  if (U1 === U2) {
    return S1 === S2 ? jacobianDouble(p) : [BigInt(0), BigInt(0), BigInt(1)];
  }
  const H = U2 - U1;
  const R = S2 - S1;
  const H2 = (H * H) % P;
  const H3 = (H * H2) % P;
  const U1H2 = (U1 * H2) % P;
  const nx = (R ** BigInt(2) - H3 - BigInt(2) * U1H2) % P;
  const ny = (R * (U1H2 - nx) - S1 * H3) % P;
  const nz = (H * p[2] * q[2]) % P;
  return [nx, ny, nz];
}

function jacobianMultiply(a: Jacobian, n: bigint): Jacobian {
  if (a[1] === BigInt(0) || n === BigInt(0)) {
    return [BigInt(0), BigInt(0), BigInt(1)];
  }
  if (n === BigInt(1)) {
    return a;
  }
  if (n < BigInt(0) || n >= curve.n) {
    return jacobianMultiply(a, n % curve.n);
  }
  if (n % BigInt(2) === BigInt(0)) {
    return jacobianDouble(jacobianMultiply(a, n / BigInt(2)));
  } else {
    // n % BigInt(2)  === BigInt(1)
    return jacobianAdd(jacobianDouble(jacobianMultiply(a, n / BigInt(2))), a);
  }
}

function fastMultiply(point: Point, scalar: bigint): Point {
  return fromJacobian(jacobianMultiply(toJacobian(point), scalar));
}

function fastAdd(a: Point, b: Point): Point {
  return fromJacobian(jacobianAdd(toJacobian(a), toJacobian(b)));
}
