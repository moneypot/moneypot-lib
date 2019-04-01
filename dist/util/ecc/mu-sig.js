"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const _1 = require(".");
const check = require("./check");
const sha256_1 = require("../bcrypto/sha256");
const util_1 = require("./util");
// https://blockstream.com/2018/01/23/musig-key-aggregation-schnorr-signatures/
function calculateL(pubkeys) {
    return sha256_1.default.digest(util_1.concatBuffers(...pubkeys.map(util_1.pointToBuffer)));
}
function pubkeyCombine(pubkeys) {
    assert(pubkeys.length > 0, 'must combine at least one pubkey');
    const L = calculateL(pubkeys);
    let X = _1.INFINITE_POINT;
    for (let i = 0; i < pubkeys.length; i++) {
        const Xi = pubkeys[i];
        const coefficient = calculateCoefficient(L, i);
        const summand = _1.pointMultiply(Xi, coefficient);
        if (X === _1.INFINITE_POINT) {
            X = summand;
        }
        else {
            X = _1.pointAdd(X, summand);
        }
    }
    return X;
}
exports.pubkeyCombine = pubkeyCombine;
const MUSIG_TAG = sha256_1.default.digest(util_1.utf8ToBuffer('MuSig coefficient'));
function calculateCoefficient(L, idx) {
    const ab = new ArrayBuffer(4);
    const view = new DataView(ab);
    view.setUint32(0, idx, true); // true for LE
    const idxBuf = new Uint8Array(ab);
    const data = sha256_1.default.digest(util_1.concatBuffers(MUSIG_TAG, MUSIG_TAG, L, idxBuf));
    return util_1.bufferToBigInt(data) % util_1.curve.n;
}
// Non-interactive: We must know all signer private keys.
function signNoninteractively(privkeys, message) {
    assert(privkeys.length > 0, 'must sign with at least one privkey');
    check.privkeysAreUnique(privkeys);
    const rs = [];
    const Xs = [];
    let R = _1.INFINITE_POINT;
    for (const privateKey of privkeys) {
        const ri = util_1.getK0(privateKey, message);
        const Ri = _1.pointMultiply(util_1.curve.g, ri);
        const Xi = _1.Point.fromPrivKey(privateKey);
        rs.push(ri);
        Xs.push(Xi);
        if (R === _1.INFINITE_POINT) {
            R = Ri;
        }
        else {
            R = _1.pointAdd(R, Ri);
        }
    }
    const L = sha256_1.default.digest(util_1.concatBuffers(...Xs.map(util_1.pointToBuffer)));
    const coefficients = [];
    let X = _1.INFINITE_POINT;
    for (let i = 0; i < Xs.length; i++) {
        const Xi = Xs[i];
        const coefficient = calculateCoefficient(L, i);
        const summand = _1.pointMultiply(Xi, coefficient);
        coefficients.push(coefficient);
        if (X === _1.INFINITE_POINT) {
            X = summand;
        }
        else {
            X = _1.pointAdd(X, summand);
        }
    }
    const e = util_1.getE(R.x, X, message);
    let s = 0n;
    for (let i = 0; i < rs.length; i++) {
        const ri = util_1.getK(R, rs[i]);
        s = (s + (ri + ((e * coefficients[i] * privkeys[i]) % util_1.curve.n))) % util_1.curve.n;
    }
    const sig = { r: R.x, s };
    if (!check.isValidSignature(sig)) {
        throw new Error('somehow created an invalid sig');
    }
    return sig;
}
exports.signNoninteractively = signNoninteractively;
//# sourceMappingURL=mu-sig.js.map