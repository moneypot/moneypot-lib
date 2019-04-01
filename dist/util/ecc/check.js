"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
// This module exposes functions that:
//
//     - Sanity-check inputs to avoid mistakes
//     - Validate runtime types since lib may be consumed from JS instead of TS
//     - Validate input data / business logic
//
// This module throws CheckError so that check-site can avoid swallowing
// extraneous exceptions.
class CheckError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, CheckError);
    }
}
exports.CheckError = CheckError;
// like assert() except it throws CheckError.
//
// Use this instead of manually throwing.
function check(assertion, message) {
    if (!assertion) {
        throw new CheckError(message);
    }
}
exports.check = check;
function privkeysAreUnique(privkeys) {
    // validate runtime type
    check(Array.isArray(privkeys), 'privkeys must be array');
    // validate data
    check(privkeys.length > 0, 'privkeys array was empty');
    const seen = new Set();
    for (const privkey of privkeys) {
        check(isValidPrivkey(privkey), 'privkey must be valid');
        const serialized = _1.Scalar.toHex(privkey);
        check(!seen.has(serialized), 'privkeys must be unique');
        seen.add(serialized);
    }
    return privkeys;
}
exports.privkeysAreUnique = privkeysAreUnique;
function isValidPrivkey(privkey) {
    return typeof privkey === 'bigint' && privkey >= 1n && privkey < _1.util.curve.n;
}
exports.isValidPrivkey = isValidPrivkey;
// export function checkPrivkey(privkey: Scalar): Scalar {
//     // validate runtime type
//     check(typeof privkey === 'bigint', 'privkey must be bigint')
//     // validate data
//     check(privkey >= 1n, 'privkey must be in range 1 to n-1')
//     check(privkey < util.curve.n, 'privkey must be in range 1 to n-1')
//     return privkey
// }
function isValidSignature(sig) {
    return (typeof sig === 'object' &&
        typeof sig.r === 'bigint' &&
        typeof sig.s === 'bigint' &&
        sig.r > 0n &&
        sig.r < _1.util.curve.p &&
        sig.s > 0n &&
        sig.s < _1.util.curve.n);
}
exports.isValidSignature = isValidSignature;
function isValidPubkey(point) {
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
    return (y * y - (x * x * x + _1.util.curve.a * x + _1.util.curve.b)) % _1.util.curve.p == 0n;
}
exports.isValidPubkey = isValidPubkey;
//# sourceMappingURL=check.js.map