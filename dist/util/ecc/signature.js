import * as assert from '../assert';
import { secp256k1 as curve, bufferToHex } from './util';
import { jacobi, concatBuffers as concat, bufferToBigInt as int, pointToBuffer, bufferFromBigInt } from './util';
import { pointMultiply, pointSubtract, INFINITE_POINT } from './elliptic';
import hash from '../node-crypto/sha256';
export const Signature = {
    fromBytes(buf) {
        assert.equal(buf.length, 64);
        const r = int(buf.slice(0, 32));
        const s = int(buf.slice(32, 64));
        return { r, s };
    },
    toBytes({ r, s }) {
        return concat(bufferFromBigInt(r), bufferFromBigInt(s));
    },
    toHex(sig) {
        return bufferToHex(Signature.toBytes(sig));
    },
};
export async function sign(message, secret) {
    const m = message;
    const d = secret;
    if (d < BigInt(1) || d > curve.n - BigInt(1)) {
        throw new Error('secret must 1 <= d <= n-1');
    }
    const k0 = int(await hash(concat(bufferFromBigInt(d), m))) % curve.n;
    if (k0 === BigInt(0)) {
        throw new Error('sig failed');
    }
    const R = pointMultiply(curve.g, k0);
    // nonce
    const k = jacobi(R.y) === BigInt(1) ? k0 : curve.n - k0;
    // challenge
    const e = int(await hash(concat(bufferFromBigInt(R.x), pointToBuffer(pointMultiply(curve.g, d)), m))) % curve.n;
    const s = (k + e * d) % curve.n;
    const sig = { r: R.x, s };
    return sig;
}
export async function verify(pubkey, message, sig) {
    const m = message;
    const P = pubkey;
    const { r, s } = sig;
    // TODO: Centralize validation
    if (r >= curve.p) {
        return false;
    }
    if (s >= curve.n) {
        return false;
    }
    const e = int(await hash(concat(bufferFromBigInt(r), pointToBuffer(P), m))) % curve.n;
    const R = pointSubtract(pointMultiply(curve.g, s), pointMultiply(P, e));
    if (R === INFINITE_POINT) {
        return false;
    }
    else if (jacobi(R.y) !== BigInt(1)) {
        return false;
    }
    else {
        return R.x === r;
    }
}
//# sourceMappingURL=signature.js.map