import BlindedMessage from './blinded-message';
import BlindedSignature from './blinded-signature';
import Signature from './signature';
import * as ecc from './util/ecc';
export function blindMessage(secretRandomSeed, nonce, signer, message) {
    const [unblinder, bm] = ecc.blindMessage(secretRandomSeed, nonce, signer, message);
    return [unblinder, new BlindedMessage(bm.c)];
}
export function blindSign(signer, nonce, blindedMessage) {
    const bs = ecc.blindSign(signer.scalar, nonce.scalar, blindedMessage);
    return new BlindedSignature(bs.s);
}
export function unblind(unblinder, blindedSig) {
    const sig = ecc.unblind(unblinder, blindedSig);
    return new Signature(sig.r, sig.s);
}
//# sourceMappingURL=blind.js.map