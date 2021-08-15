"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = __importDefault(require("./blinded-message"));
const blinded_signature_1 = __importDefault(require("./blinded-signature"));
const signature_1 = __importDefault(require("./signature"));
const ecc = __importStar(require("./util/ecc"));
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