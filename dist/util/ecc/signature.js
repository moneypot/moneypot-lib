"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const check = require("./check");
const elliptic_1 = require("./elliptic");
const util_1 = require("./util");
exports.Signature = {
    fromBytes(buf) {
        if (buf.length !== 64) {
            return new Error('signature buf expected 64 bytes');
        }
        const r = util_1.bufferToBigInt(buf.slice(0, 32));
        const s = util_1.bufferToBigInt(buf.slice(32, 64));
        // TODO: checkSignature here or just let bad sigs fail in verify()?
        return { r, s };
    },
    fromHex(hex) {
        const buff = util_1.bufferFromHex(hex);
        if (buff instanceof Error) {
            return buff;
        }
        return exports.Signature.fromBytes(buff);
    },
    toBytes({ r, s }) {
        return util_1.concatBuffers(util_1.bufferFromBigInt(r), util_1.bufferFromBigInt(s));
    },
    toHex(sig) {
        return util_1.bufferToHex(exports.Signature.toBytes(sig));
    },
};
function sign(message, privkey) {
    if (!check.isValidPrivkey(privkey)) {
        throw new Error('tried to sign with invalid privkey');
    }
    const m = message;
    const d = privkey;
    const k0 = util_1.getK0(d, m);
    const R = elliptic_1.pointMultiply(util_1.curve.g, k0);
    const k = util_1.getK(R, k0); // nonce
    const e = util_1.getE(R.x, _1.Point.fromPrivKey(d), m); // challenge
    const s = (k + e * d) % util_1.curve.n;
    const sig = { r: R.x, s };
    if (!check.isValidSignature(sig)) {
        throw new Error('signing produced invalid sig?!');
    }
    return sig;
}
exports.sign = sign;
function verify(pubkey, message, sig) {
    if (!check.isValidPubkey(pubkey)) {
        throw new Error('invalid pubkey provided');
    }
    if (!check.isValidSignature(sig)) {
        throw new Error('invalid sig');
    }
    const m = message;
    const P = pubkey;
    const e = util_1.getE(sig.r, P, m);
    const R = elliptic_1.pointSubtract(elliptic_1.pointMultiply(util_1.curve.g, sig.s), elliptic_1.pointMultiply(P, e));
    if (R === elliptic_1.INFINITE_POINT) {
        return false;
    }
    else if (util_1.jacobi(R.y) !== BigInt(1)) {
        return false;
    }
    else if (R.x !== sig.r) {
        return false;
    }
    else {
        return true;
    }
}
exports.verify = verify;
//# sourceMappingURL=signature.js.map