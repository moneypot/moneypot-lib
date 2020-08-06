"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return util_1.concatBuffers(util_1.buffer32FromBigInt(r), util_1.buffer32FromBigInt(s));
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
    const e = util_1.getE(R.x, elliptic_1.Point.fromPrivKey(d), m); // challenge
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
function verifyECDSA(pubkey, message, sig) {
    if (!check.isValidPubkey(pubkey)) {
        throw new Error('invalid pubkey provided');
    }
    if (!check.isValidSignature(sig)) {
        throw new Error('invalid sig');
    }
    const m = message;
    const P = pubkey;
    const e = elliptic_1.Scalar.fromBytes(m);
    if (e instanceof Error) {
        throw new Error('invalid e scalar');
    }
    const sInv = util_1.modInverse(sig.s, util_1.curve.n);
    const u1 = util_1.mod(e * sInv, util_1.curve.n);
    const u2 = util_1.mod(sig.r * sInv, util_1.curve.n);
    const S = elliptic_1.pointAdd(elliptic_1.pointMultiply(util_1.curve.g, u1), elliptic_1.pointMultiply(P, u2));
    const V = util_1.mod(S.x, util_1.curve.n);
    if (S === elliptic_1.INFINITE_POINT) {
        return false;
    }
    if (V === sig.r) {
        return true;
    }
    else {
        return false;
    }
}
exports.verifyECDSA = verifyECDSA;
// this is for ecdsa?! not schnorr ?!
function ecdsaRecover(message, sig, j) {
    // var sigObj = { r: signature.slice(0, 32), s: signature.slice(32, 64) }
    // var sigr = new BN(sigObj.r)
    // var sigs = new BN(sigObj.s)
    // if (sigr.cmp(ecparams.n) >= 0 || sigs.cmp(ecparams.n) >= 0) throw new Error(messages.ECDSA_SIGNATURE_PARSE_FAIL)
    if (!check.isValidSignature(sig)) {
        throw new Error('invalid sig');
    }
    if ((3 & j) !== j) {
        throw new Error('The recovery param is more than two bits');
    }
    let e = elliptic_1.Scalar.fromBytes(message);
    if (e instanceof Error) {
        throw e;
    }
    let r = sig.r;
    // A set LSB signifies that the y-coordinate is odd
    var isYOdd = (j & 1) == 1;
    var isSecondKey = j >> 1;
    // if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey)
    //   throw new Error('Unable to find sencond key candinate');
    if (r >= util_1.curve.p % util_1.curve.n && isSecondKey) {
        throw new Error('Unable to find second key coordinate');
    }
    // 1.1. Let x = r + jn.
    const r2 = elliptic_1.Point.fromX(r + (isSecondKey ? util_1.curve.n : BigInt(0)), isYOdd);
    if (r2 instanceof Error) {
        throw r2;
    }
    let rInv = util_1.modInverse(sig.r, util_1.curve.n);
    //var s1 = n.sub(e).mul(rInv).umod(n);
    let s1 = util_1.mod((util_1.curve.n - e) * rInv, util_1.curve.n);
    // var s2 = s.mul(rInv).umod(n);
    let s2 = util_1.mod(sig.s * rInv, util_1.curve.n);
    // 1.6.1 Compute Q = r^-1 (sR -  eG)
    //               Q = r^-1 (sR + -eG)
    // return this.g.mulAdd(s1, r, s2);
    return elliptic_1.pointAdd(elliptic_1.pointMultiply(util_1.curve.g, s1), elliptic_1.pointMultiply(r2, s2));
}
exports.ecdsaRecover = ecdsaRecover;
//# sourceMappingURL=signature.js.map