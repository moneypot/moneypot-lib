"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("../assert");
const _1 = require(".");
const check = require("./check");
const sha256_1 = require("../bcrypto/sha256");
const util_1 = require("./util");
const elliptic_1 = require("./elliptic");
// https://blockstream.com/2018/01/23/musig-key-aggregation-schnorr-signatures/
function calculateL(pubkeys) {
    return sha256_1.default.digest(util_1.concatBuffers(...pubkeys.map(util_1.pointToBuffer)));
}
function pubkeyCombine(pubkeys) {
    assert.equal(pubkeys.length > 0, true);
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
function privkeyCombine(privkeys) {
    assert.equal(privkeys.length > 0, true);
    check.privkeysAreUnique(privkeys);
    const Xs = [];
    let R = _1.INFINITE_POINT;
    for (const privateKey of privkeys) {
        const Xi = _1.Point.fromPrivKey(privateKey);
        Xs.push(Xi);
        if (R === _1.INFINITE_POINT) {
            R = Xi;
        }
        else {
            R = _1.pointAdd(R, Xi);
        }
    }
    const L = sha256_1.default.digest(util_1.concatBuffers(...Xs.map(util_1.pointToBuffer)));
    let X = BigInt(0);
    for (let i = 0; i < privkeys.length; i++) {
        const Xi = privkeys[i];
        const coefficient = calculateCoefficient(L, i);
        const summand = elliptic_1.scalarMultiply(Xi, coefficient);
        if (X === BigInt(0)) {
            X = summand;
        }
        else {
            X = elliptic_1.scalarAdd(X, summand);
        }
    }
    return X;
}
exports.privkeyCombine = privkeyCombine;
const MUSIG_TAG = sha256_1.default.digest(util_1.utf8ToBuffer('MuSig coefficient'));
function calculateCoefficient(L, idx) {
    const ab = new ArrayBuffer(4);
    const view = new DataView(ab);
    view.setUint32(0, idx, true); // true for LE
    const idxBuf = new Uint8Array(ab);
    const data = sha256_1.default.digest(util_1.concatBuffers(MUSIG_TAG, MUSIG_TAG, L, idxBuf));
    return util_1.bufferToBigInt(data) % util_1.curve.n;
}
//# sourceMappingURL=mu-sig.js.map