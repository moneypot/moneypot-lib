import { pointMultiply as mul, pointAdd as add, scalarAdd, scalarMultiply } from './elliptic';
import { secp256k1 as curve, bufferToBigInt, bufferFromBigInt, jacobi, pointToBuffer, } from './util';
import * as buffutils from '../buffutils';
import hash from '../bcrypto/sha256';
export function blindMessage(secret, nonce, signer, message) {
    const R = nonce;
    const P = signer;
    const alpha = bufferToBigInt(hash.mac(buffutils.fromString('alpha'), buffutils.concat(secret, pointToBuffer(nonce), pointToBuffer(signer), message)));
    // spin beta until we find quadratic residue
    let retry = 0;
    let beta;
    let RPrime;
    while (true) {
        beta = bufferToBigInt(hash.mac(buffutils.fromString('beta'), buffutils.concat(secret, pointToBuffer(nonce), pointToBuffer(signer), message, Uint8Array.of(retry))));
        RPrime = add(R, mul(curve.g, alpha), mul(P, beta));
        if (jacobi(RPrime.y) === BigInt(1)) {
            break;
        }
        else {
            retry++;
        }
    }
    // the challenge
    const cPrime = bufferToBigInt(hash.digest(bufferFromBigInt(RPrime.x), pointToBuffer(P), message)) % curve.n;
    // the blinded challenge
    const c = scalarAdd(cPrime, beta);
    return [{ alpha, r: RPrime.x }, { c }];
}
export function blindSign(signer, nonce, { c }) {
    const s = scalarAdd(nonce, scalarMultiply(c, signer));
    return { s };
}
export function unblind({ alpha, r }, blindedSig) {
    const s = scalarAdd(blindedSig.s, alpha);
    return { r, s };
}
//# sourceMappingURL=blind.js.map