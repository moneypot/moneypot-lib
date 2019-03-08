"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = require("./util/ecc");
const Buffutils = require("./util/buffutils");
const public_key_1 = require("./public-key");
const hash_1 = require("./hash");
const sha256_1 = require("./util/bcrypto/sha256");
const MUSIG_TAG = sha256_1.default.digest(Buffutils.fromString('MuSig coefficient'));
class MuSig {
    static computeEll(pubKeys) {
        // concat all pubkeys in compressed form, and sha256 it..
        return sha256_1.default.digest(...pubKeys.map(p => ecc.Point.toBytes(p)));
    }
    static computeCoefficient(ell, idx) {
        const idxBuf = Buffutils.fromUint32(idx);
        const data = Buffutils.concat(MUSIG_TAG, MUSIG_TAG, ell, idxBuf);
        const hash = sha256_1.default.digest(data);
        const coefficient = ecc.Scalar.fromBytes(hash);
        if (coefficient instanceof Error) {
            throw coefficient;
        }
        return coefficient;
    }
    static sign(privateKeys, message) {
        const rs = [];
        const Xs = [];
        for (const privateKey of privateKeys) {
            const ri = ecc.Scalar.fromBytes(hash_1.default.fromMessage('MuSig.k', privateKey.buffer, message).buffer);
            if (ri instanceof Error) {
                throw ri;
            }
            const Xi = privateKey.toPublicKey();
            rs.push(ri);
            Xs.push(Xi);
        }
        const R = ecc.pointAdd(...rs.map(ri => {
            const Ri = ecc.Point.fromPrivKey(ri);
            if (Ri instanceof Error) {
                throw Ri;
            }
            return Ri;
        }));
        // TODO: check Xs are unique...
        //   check.checkPubKeysUnique(Xs);
        const ell = MuSig.computeEll(Xs);
        const coefficients = [];
        let X;
        for (let i = 0; i < Xs.length; i++) {
            const Xi = Xs[i];
            const coefficient = MuSig.computeCoefficient(ell, i);
            const summand = ecc.pointMultiply(Xi, coefficient);
            coefficients.push(coefficient);
            if (X === undefined) {
                X = summand;
            }
            else {
                X = ecc.pointAdd(X, summand);
            }
        }
        let e = getE(R.x, X, message);
        // TODO...
        throw new Error('TODO:...');
    }
    static combinePublicKeys(publicKeys) {
        const ell = MuSig.computeEll(publicKeys);
        let X = null;
        for (let i = 0; i < publicKeys.length; i++) {
            const Xi = publicKeys[i];
            const coefficient = MuSig.computeCoefficient(ell, i);
            const summand = ecc.pointMultiply(Xi, coefficient);
            if (X === null) {
                X = summand;
            }
            else {
                X = ecc.pointAdd(X, summand);
            }
        }
        return new public_key_1.default(X.x, X.y);
    }
}
exports.default = MuSig;
function getE(Rx, P, m) {
    const hash = sha256_1.default.digest(ecc.Scalar.toBytes(Rx), ecc.Point.toBytes(P), m);
    const e = ecc.Scalar.fromBytes(hash);
    if (e instanceof Error) {
        throw e;
    }
    return e;
}
//# sourceMappingURL=musig.js.map