import { Point, Scalar, Signature, util } from '.';

// This module exposes functions that:
//
//     - Sanity-check inputs to avoid mistakes
//     - Validate runtime types since lib may be consumed from JS instead of TS
//     - Validate input data / business logic
//
// This module throws CheckError so that check-site can avoid swallowing
// extraneous exceptions.

export class CheckError extends Error {
  constructor(...args: any[]) {
    super(...args);
    Error.captureStackTrace(this, CheckError);
  }
}

// like assert() except it throws CheckError.
//
// Use this instead of manually throwing.
export function check(assertion: boolean, message: string) {
  if (!assertion) {
    throw new CheckError(message);
  }
}

export function privkeysAreUnique(privkeys: Scalar[]) {
  // validate runtime type
  check(Array.isArray(privkeys), 'privkeys must be array');
  // validate data
  check(privkeys.length > 0, 'privkeys array was empty');
  const seen = new Set();
  for (const privkey of privkeys) {
    check(isValidPrivkey(privkey), 'privkey must be valid');
    const serialized = Scalar.toHex(privkey);
    check(!seen.has(serialized), 'privkeys must be unique');
    seen.add(serialized);
  }
  return privkeys;
}

export function isValidPrivkey(privkey: any): privkey is Scalar {
  return typeof privkey === 'bigint' && privkey >= BigInt(1) && privkey < util.curve.n;
}

// export function checkPrivkey(privkey: Scalar): Scalar {
//     // validate runtime type
//     check(typeof privkey === 'bigint', 'privkey must be bigint')
//     // validate data
//     check(privkey >= BigInt(1) , 'privkey must be in range 1 to n-1')
//     check(privkey < util.curve.n, 'privkey must be in range 1 to n-1')
//     return privkey
// }

export function isValidSignature(sig: any): sig is Signature {
  return (
    typeof sig === 'object' &&
    typeof sig.r === 'bigint' &&
    typeof sig.s === 'bigint' &&
    sig.r > BigInt(0) &&
    sig.r < util.curve.p &&
    sig.s > BigInt(0) &&
    sig.s < util.curve.n
  );
}

export function isValidPubkey(point: any): point is Point {
  if (typeof point !== 'object') {
    return false;
  }
  const { x, y } = point;
  if (typeof x !== 'bigint') {
    return false;
  }
  if (typeof y !== 'bigint') {
    return false;
  }

  return (y * y - (x * x * x + util.curve.a * x + util.curve.b)) % util.curve.p == BigInt(0);
}
