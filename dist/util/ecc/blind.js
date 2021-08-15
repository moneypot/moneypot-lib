"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elliptic_1 = require("./elliptic");
const sha256_1 = __importDefault(require("../bcrypto/sha256"));
const util_1 = require("./util");
function blindMessage(secret, nonce, signer, message) {
    const R = nonce;
    const P = signer;
    const alpha = util_1.bufferToBigInt(sha256_1.default.mac(util_1.utf8ToBuffer('alpha'), util_1.concatBuffers(secret, util_1.pointToBuffer(nonce), util_1.pointToBuffer(signer), message)));
    // spin beta until we find quadratic residue
    let retry = 0;
    let beta;
    let RPrime;
    while (true) {
        beta = util_1.bufferToBigInt(sha256_1.default.mac(util_1.utf8ToBuffer('beta'), util_1.concatBuffers(secret, util_1.pointToBuffer(nonce), util_1.pointToBuffer(signer), message, Uint8Array.of(retry))));
        RPrime = elliptic_1.pointAdd(R, elliptic_1.pointMultiply(util_1.curve.g, alpha), elliptic_1.pointMultiply(P, beta));
        if (util_1.jacobi(RPrime.y) === BigInt(1)) {
            break;
        }
        else {
            retry++;
        }
    }
    // the challenge
    const cPrime = util_1.getE(RPrime.x, P, message);
    // the blinded challenge
    const c = elliptic_1.scalarAdd(cPrime, beta);
    return [{ alpha, r: RPrime.x }, { c }];
}
exports.blindMessage = blindMessage;
function blindSign(signer, nonce, { c }) {
    const x = signer;
    const k = nonce;
    const s = elliptic_1.scalarAdd(k, elliptic_1.scalarMultiply(c, x));
    return { s };
}
exports.blindSign = blindSign;
function unblind({ alpha, r }, blindedSig) {
    const s = elliptic_1.scalarAdd(blindedSig.s, alpha);
    return { r, s };
}
exports.unblind = unblind;
function blindVerify(blindedSig, nonce, message, signer) {
    return elliptic_1.pointAdd(nonce, elliptic_1.pointMultiply(signer, message)).x === elliptic_1.pointMultiply(util_1.curve.g, blindedSig).x;
}
exports.blindVerify = blindVerify;
//# sourceMappingURL=blind.js.map