"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("../assert"));
const sha256_1 = __importDefault(require("../bcrypto/sha256"));
const check_1 = require("./check");
const buffutils_1 = require("../buffutils");
// secp256k1 parameters
exports.curve = {
    a: BigInt(0),
    b: BigInt(7),
    p: BigInt('115792089237316195423570985008687907853269984665640564039457584007908834671663'),
    g: {
        x: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
        y: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
    },
    // order
    n: BigInt('115792089237316195423570985008687907852837564279074904382605163141518161494337'),
};
// Handles negative quotients.
//
//      -34 % 23 === -11
//      mod(-34, 23) === 12
function mod(a, b) {
    return ((a % b) + b) % b;
}
exports.mod = mod;
// pows then mods, but uses intermediate mods to keep intermediate number within bigint range
function powmod(base, exp, m) {
    if (exp === BigInt(0)) {
        return BigInt(1);
    }
    if (exp % BigInt(2) === BigInt(0)) {
        return mod(powmod(base, exp / BigInt(2), m) ** BigInt(2), m);
    }
    else {
        return mod(base * powmod(base, exp - BigInt(1), m), m);
    }
}
exports.powmod = powmod;
// a^-1 mod m
function modInverse(a, m) {
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
    assert_1.default(d === BigInt(1));
    if (ud > 0) {
        return ud;
    }
    else {
        return ud + m;
    }
}
exports.modInverse = modInverse;
function bigIntSqrt(n) {
    if (n < BigInt(0)) {
        throw new Error('cannot sqrt negative number');
    }
    if (n < BigInt(2)) {
        return n;
    }
    // tslint:disable-next-line: no-shadowed-variable
    function newtonIteration(n, x0) {
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
exports.bigintToHex = (n) => n.toString(16).padStart(64, '0');
function bufferToHex(buf) {
    let result = '';
    for (const b of buf) {
        const value = b.toString(16);
        result += value.length === 1 ? '0' + value : value;
    }
    return result;
}
exports.bufferToHex = bufferToHex;
function bufferFromHex(hex) {
    if (hex.length % 2 === 1 || !/^[0-9a-fA-F]+$/.test(hex)) {
        return new Error('invalid hex string');
    }
    return new Uint8Array(hex.match(/.{1,2}/g).map(byte => Number.parseInt(byte, 16)));
}
exports.bufferFromHex = bufferFromHex;
// export function bufferToBigInt(buf: Uint8Array): bigint {
//     return BigInt('0x' + bufferToHex(buf))
// }
function bufferToBigInt(bytes) {
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
exports.bufferToBigInt = bufferToBigInt;
// Buffer is fixed-length 32bytes
function buffer32FromBigInt(n) {
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
exports.buffer32FromBigInt = buffer32FromBigInt;
function concatBuffers(...bufs) {
    let totalSize = 0;
    for (const buf of bufs) {
        assert_1.default(buf instanceof Uint8Array);
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
exports.concatBuffers = concatBuffers;
// 33 bytes: // first byte represents y, next 32 bytes are x coord
function pointFromBuffer(buf) {
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
exports.pointFromBuffer = pointFromBuffer;
function pointFromX(x, isOdd) {
    if (isOdd !== BigInt(0) && isOdd !== BigInt(1)) {
        throw new Error('isOdd must be 0n or 1n');
    }
    const { p } = exports.curve;
    const ysq = (powmod(x, BigInt(3), p) + BigInt(7)) % p;
    const y0 = powmod(ysq, (p + BigInt(1)) / BigInt(4), p);
    if (powmod(y0, BigInt(2), p) !== ysq) {
        return new Error('point not on curve');
    }
    const y = (y0 & BigInt(1)) !== isOdd ? p - y0 : y0;
    const point = { x, y };
    assert_1.default(check_1.isValidPubkey(point));
    return point;
}
exports.pointFromX = pointFromX;
function pointToBuffer(point) {
    // 0x02: y is even
    // 0x03: y is odd
    const b0 = point.y % BigInt(2) === BigInt(0) ? 0x02 : 0x03;
    const xbuf = buffer32FromBigInt(point.x);
    assert_1.default(xbuf.length === 32);
    const result = new Uint8Array(33);
    result.set([b0], 0);
    result.set(xbuf, 1);
    return result;
}
exports.pointToBuffer = pointToBuffer;
function isEven(y) {
    return y % BigInt(2) === BigInt(0);
}
exports.isEven = isEven;
function constantTimeBufferEquals(a, b) {
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
exports.constantTimeBufferEquals = constantTimeBufferEquals;
function utf8ToBuffer(text) {
    return new TextEncoder().encode(text);
}
exports.utf8ToBuffer = utf8ToBuffer;
function isPointOnCurve({ x, y }) {
    const { p, a, b } = exports.curve;
    return (y * y - (x * x * x + a * x + b)) % p === BigInt(0);
}
exports.isPointOnCurve = isPointOnCurve;
function jacobi(y) {
    return powmod(y, (exports.curve.p - BigInt(1)) / BigInt(2), exports.curve.p);
}
exports.jacobi = jacobi;
function getK(R, k0) {
    return jacobi(R.y) === BigInt(1) ? k0 : exports.curve.n - k0;
}
exports.getK = getK;
function getK0(privkey, message) {
    const k0 = bufferToBigInt(sha256_1.default.digest(concatBuffers(buffer32FromBigInt(privkey), message))) % exports.curve.n;
    if (k0 === BigInt(0)) {
        // We got incredibly unlucky
        throw new Error('k0 is zero');
    }
    return k0;
}
exports.getK0 = getK0;
function getE(Rx, P, m) {
    return bufferToBigInt(sha256_1.default.digest(concatBuffers(buffer32FromBigInt(Rx), pointToBuffer(P), m))) % exports.curve.n;
}
exports.getE = getE;
function standardGetEBIP340(Rx, Px, m) {
    const tag = sha256_1.default.digest(buffutils_1.fromString('BIP0340/challenge'));
    return (bufferToBigInt(sha256_1.default.digest(concatBuffers(tag, tag, buffer32FromBigInt(Rx), buffer32FromBigInt(Px), m))) % exports.curve.n);
}
exports.standardGetEBIP340 = standardGetEBIP340;
//# sourceMappingURL=util.js.map