export function is(t) {
    return (x) => x instanceof t;
}
export function isBuffer32(x) {
    return x instanceof Uint8Array && x.length === 32;
}
export function isBuffer33(x) {
    return x instanceof Uint8Array && x.length === 33;
}
export function isUint8(x) {
    return Number.isInteger(x) && x >= 0 && x < 2 ** 8;
}
export function isUint32(x) {
    return Number.isInteger(x) && x >= 0 && x < 2 ** 32;
}
export function isUint64(x) {
    return Number.isInteger(x) && x >= 0 && x <= Number.MAX_SAFE_INTEGER;
}
export function isString(x) {
    return typeof x === 'string';
}
export function isArrayOf(f) {
    return (x) => Array.isArray(x) && x.every(f);
}
export function isOneOf(arr) {
    return (x) => arr.includes(x);
}
//# sourceMappingURL=types.js.map