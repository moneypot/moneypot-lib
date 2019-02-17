export function is(t: any) {
  return (x: any) => x instanceof t;
}

export function isBuffer32(x: any) {
  return x instanceof Uint8Array && x.length === 32;
}
export function isBuffer33(x: any) {
  return x instanceof Uint8Array && x.length === 33;
}

export function isUint8(x: any) {
  return Number.isInteger(x) && x >= 0 && x < 2 ** 8;
}

export function isUint32(x: any) {
  return Number.isInteger(x) && x >= 0 && x < 2 ** 32;
}

export function isUint64(x: any) {
  return Number.isInteger(x) && x >= 0 && x <= Number.MAX_SAFE_INTEGER;
}

export function isString(x: any) {
  return typeof x === 'string';
}

export function isArrayOf(f: any) {
  return (x: any) => Array.isArray(x) && x.every(f);
}

export function isOneOf(arr: any) {
  return (x: any) => arr.includes(x);
}
