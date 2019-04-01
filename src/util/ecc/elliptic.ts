import * as check from './check';
import {
  bufferFromBigInt,
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
    return bufferFromBigInt(n);
  },
  toHex(n: Scalar): string {
    return bufferToHex(bufferFromBigInt(n));
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
      ? ((3n * a.x * a.x + curve.a) * powmod(2n * a.y, curve.p - 2n, curve.p)) % curve.p
      : ((b.y - a.y) * powmod(b.x - a.x, curve.p - 2n, curve.p)) % curve.p;
  const x3 = (lam * lam - a.x - b.x) % curve.p;
  const y = mod(lam * (a.x - x3) - a.y, curve.p);
  return { x: x3, y };
}

export function naiveMultiply(point: Point, scalar: bigint): Point {
  scalar = scalar % curve.n;
  let r = INFINITE_POINT;
  for (let i = 0n; i < 256n; i++) {
    if ((scalar >> i) & 1n) {
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
  if (a === 0n) {
    return 0n;
  }
  let [lm, hm, low, high] = [1n, 0n, mod(a, n), n];
  while (low > 1) {
    const r = high / low;
    const [nm, _new] = [hm - lm * r, high - low * r];
    [lm, low, hm, high] = [nm, _new, lm, low];
  }
  return lm % n;
}

function fromJacobian(j: Jacobian): Point {
  if (j[0] === 0n && j[1] === 0n) {
    return INFINITE_POINT;
  }
  const z = inv(j[2], curve.p);
  const x = (j[0] * z ** 2n) % curve.p;
  const y = mod(j[1] * z ** 3n, curve.p);
  return { x, y };
}

function toJacobian(point: Point): Jacobian {
  return [point.x, point.y, 1n];
}

function jacobianDouble(p: Jacobian): Jacobian {
  if (p[1] === 0n) {
    return [0n, 0n, 0n];
  }
  const ysq = p[1] ** 2n % curve.p;
  const S = (4n * p[0] * ysq) % curve.p;
  const M = (3n * p[0] ** 2n + curve.a * p[2] ** 4n) % curve.p;
  const nx = (M ** 2n - 2n * S) % curve.p;
  const ny = (M * (S - nx) - 8n * ysq ** 2n) % curve.p;
  const nz = (2n * p[1] * p[2]) % curve.p;
  return [nx, ny, nz];
}

function jacobianAdd(p: Jacobian, q: Jacobian): Jacobian {
  const P = curve.p;

  if (p[1] === 0n) {
    return q;
  }
  if (q[1] === 0n) {
    return p;
  }
  const U1 = (p[0] * q[2] ** 2n) % P;
  const U2 = (q[0] * p[2] ** 2n) % P;
  const S1 = (p[1] * q[2] ** 3n) % P;
  const S2 = (q[1] * p[2] ** 3n) % P;
  if (U1 === U2) {
    return S1 === S2 ? jacobianDouble(p) : [0n, 0n, 1n];
  }
  const H = U2 - U1;
  const R = S2 - S1;
  const H2 = (H * H) % P;
  const H3 = (H * H2) % P;
  const U1H2 = (U1 * H2) % P;
  const nx = (R ** 2n - H3 - 2n * U1H2) % P;
  const ny = (R * (U1H2 - nx) - S1 * H3) % P;
  const nz = (H * p[2] * q[2]) % P;
  return [nx, ny, nz];
}

function jacobianMultiply(a: Jacobian, n: bigint): Jacobian {
  if (a[1] === 0n || n === 0n) {
    return [0n, 0n, 1n];
  }
  if (n === 1n) {
    return a;
  }
  if (n < 0n || n >= curve.n) {
    return jacobianMultiply(a, n % curve.n);
  }
  if (n % 2n === 0n) {
    return jacobianDouble(jacobianMultiply(a, n / 2n));
  } else {
    // n % 2n === 1n
    return jacobianAdd(jacobianDouble(jacobianMultiply(a, n / 2n)), a);
  }
}

function fastMultiply(point: Point, scalar: bigint): Point {
  return fromJacobian(jacobianMultiply(toJacobian(point), scalar));
}

function fastAdd(a: Point, b: Point): Point {
  return fromJacobian(jacobianAdd(toJacobian(a), toJacobian(b)));
}
