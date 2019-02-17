"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../assert");
const util_1 = require("./util");
const util_2 = require("./util");
const elliptic_1 = require("./elliptic");
const sha256_1 = require("./sha256");
exports.Signature = {
    fromBytes(buf) {
        assert.equal(buf.length, 64);
        const r = util_2.bufferToBigInt(buf.slice(0, 32));
        const s = util_2.bufferToBigInt(buf.slice(32, 64));
        return { r, s };
    },
    toBytes({ r, s }) {
        return util_2.concatBuffers(util_2.bufferFromBigInt(r), util_2.bufferFromBigInt(s));
    },
    toHex(sig) {
        return util_1.bufferToHex(exports.Signature.toBytes(sig));
    },
};
function sign(message, secret) {
    const m = message;
    const d = secret;
    if (d < BigInt(1) || d > util_1.secp256k1.n - BigInt(1)) {
        throw new Error('secret must 1 <= d <= n-1');
    }
    const k0 = util_2.bufferToBigInt(sha256_1.hash(util_2.concatBuffers(util_2.bufferFromBigInt(d), m))) % util_1.secp256k1.n;
    if (k0 === BigInt(0)) {
        throw new Error('sig failed');
    }
    const R = elliptic_1.pointMultiply(util_1.secp256k1.g, k0);
    // nonce
    const k = util_2.jacobi(R.y) === BigInt(1) ? k0 : util_1.secp256k1.n - k0;
    // challenge
    const e = util_2.bufferToBigInt(sha256_1.hash(util_2.concatBuffers(util_2.bufferFromBigInt(R.x), util_2.pointToBuffer(elliptic_1.pointMultiply(util_1.secp256k1.g, d)), m))) % util_1.secp256k1.n;
    const s = (k + e * d) % util_1.secp256k1.n;
    const sig = { r: R.x, s };
    return sig;
}
exports.sign = sign;
function verify(pubkey, message, sig) {
    const m = message;
    const P = pubkey;
    const { r, s } = sig;
    // TODO: Centralize validation
    if (r >= util_1.secp256k1.p) {
        return false;
    }
    if (s >= util_1.secp256k1.n) {
        return false;
    }
    const e = util_2.bufferToBigInt(sha256_1.hash(util_2.concatBuffers(util_2.bufferFromBigInt(r), util_2.pointToBuffer(P), m))) % util_1.secp256k1.n;
    const R = elliptic_1.pointSubtract(elliptic_1.pointMultiply(util_1.secp256k1.g, s), elliptic_1.pointMultiply(P, e));
    if (R === elliptic_1.INFINITE_POINT) {
        return false;
    }
    else if (util_2.jacobi(R.y) !== BigInt(1)) {
        return false;
    }
    else if (R.x !== r) {
        return false;
    }
    else {
        return true;
    }
}
exports.verify = verify;
//# sourceMappingURL=signature.js.map