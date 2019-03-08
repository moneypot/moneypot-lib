"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../assert");
const util_1 = require("./util");
const util_2 = require("./util");
const Buffutils = require("../buffutils");
const elliptic_1 = require("./elliptic");
const sha256_1 = require("../bcrypto/sha256");
exports.Signature = {
    fromBytes(buf) {
        assert.equal(buf.length, 64);
        const r = Buffutils.toBigInt(buf.slice(0, 32));
        const s = Buffutils.toBigInt(buf.slice(32, 64));
        return { r, s };
    },
    toBytes({ r, s }) {
        return Buffutils.concat(util_2.bufferFromBigInt(r), util_2.bufferFromBigInt(s));
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
    const k0 = Buffutils.toBigInt(sha256_1.default.digest(util_2.bufferFromBigInt(d), m)) % util_1.secp256k1.n;
    if (k0 === BigInt(0)) {
        throw new Error('sig failed');
    }
    const R = elliptic_1.pointMultiply(util_1.secp256k1.g, k0);
    // nonce
    const k = util_2.jacobi(R.y) === BigInt(1) ? k0 : util_1.secp256k1.n - k0;
    // challenge
    const e = Buffutils.toBigInt(sha256_1.default.digest(util_2.bufferFromBigInt(R.x), util_2.pointToBuffer(elliptic_1.pointMultiply(util_1.secp256k1.g, d)), m)) % util_1.secp256k1.n;
    const s = (k + e * d) % util_1.secp256k1.n;
    return { r: R.x, s };
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
    const e = Buffutils.toBigInt(sha256_1.default.digest(util_2.bufferFromBigInt(r), util_2.pointToBuffer(P), m)) % util_1.secp256k1.n;
    const R = elliptic_1.pointSubtract(elliptic_1.pointMultiply(util_1.secp256k1.g, s), elliptic_1.pointMultiply(P, e));
    if (R === elliptic_1.INFINITE_POINT) {
        return false;
    }
    else if (util_2.jacobi(R.y) !== BigInt(1)) {
        return false;
    }
    else {
        return R.x === r;
    }
}
exports.verify = verify;
//# sourceMappingURL=signature.js.map