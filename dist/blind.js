"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const blinded_signature_1 = require("./blinded-signature");
const signature_1 = require("./signature");
const ecc = require("./util/ecc");
function blindMessage(secretRandomSeed, nonce, signer, message) {
    const [unblinder, bm] = ecc.blindMessage(secretRandomSeed, nonce, signer, message);
    return [unblinder, new blinded_message_1.default(bm.c)];
}
exports.blindMessage = blindMessage;
function blindSign(signer, nonce, blindedMessage) {
    const bs = ecc.blindSign(signer.scalar, nonce.scalar, blindedMessage);
    return new blinded_signature_1.default(bs.s);
}
exports.blindSign = blindSign;
function unblind(unblinder, blindedSig) {
    const sig = ecc.unblind(unblinder, blindedSig);
    return new signature_1.default(sig.r, sig.s);
}
exports.unblind = unblind;
//# sourceMappingURL=blind.js.map