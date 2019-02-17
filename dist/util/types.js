"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function is(t) {
    return (x) => x instanceof t;
}
exports.is = is;
function isBuffer32(x) {
    return x instanceof Uint8Array && x.length === 32;
}
exports.isBuffer32 = isBuffer32;
function isBuffer33(x) {
    return x instanceof Uint8Array && x.length === 33;
}
exports.isBuffer33 = isBuffer33;
function isUint8(x) {
    return Number.isInteger(x) && x >= 0 && x < 2 ** 8;
}
exports.isUint8 = isUint8;
function isUint32(x) {
    return Number.isInteger(x) && x >= 0 && x < 2 ** 32;
}
exports.isUint32 = isUint32;
function isUint64(x) {
    return Number.isInteger(x) && x >= 0 && x <= Number.MAX_SAFE_INTEGER;
}
exports.isUint64 = isUint64;
function isString(x) {
    return typeof x === 'string';
}
exports.isString = isString;
function isArrayOf(f) {
    return (x) => Array.isArray(x) && x.every(f);
}
exports.isArrayOf = isArrayOf;
function isOneOf(arr) {
    return (x) => arr.includes(x);
}
exports.isOneOf = isOneOf;
//# sourceMappingURL=types.js.map