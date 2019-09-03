"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const magnitude_1 = require("./magnitude");
class ClaimRequest {
    constructor(claimableHash, coinRequests, authorization) {
        this.claimableHash = claimableHash;
        this.coinRequests = coinRequests;
        this.authorization = authorization;
    }
    static newAuthorized(claimableHash, coinRequests, claimantPrivateKey) {
        const hash = ClaimRequest.hashOf(claimableHash, coinRequests);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(claimableHash, coinRequests, authorization);
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimRequest.fromPOD expected an object');
        }
        const claimableHash = hash_1.default.fromPOD(data.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        if (!Array.isArray(data.coinRequests)) {
            return new Error('ClaimRequest.fromPOD expected an array for coinRequests');
        }
        const coinRequests = [];
        for (const coin of data.coinRequests) {
            const blindingNonce = public_key_1.default.fromPOD(coin.blindingNonce);
            if (blindingNonce instanceof Error) {
                return blindingNonce;
            }
            const blindedOwner = blinded_message_1.default.fromPOD(coin.blindedOwner);
            if (blindedOwner instanceof Error) {
                return blindedOwner;
            }
            const magnitude = magnitude_1.default.fromPOD(coin.magnitude);
            if (magnitude instanceof Error) {
                return magnitude;
            }
            coinRequests.push({ blindingNonce, blindedOwner, magnitude });
        }
        const authorization = signature_1.default.fromPOD(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new ClaimRequest(claimableHash, coinRequests, authorization);
    }
    static hashOf(claimableHash, coinRequests) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(claimableHash.buffer);
        for (const cc of coinRequests) {
            h.update(cc.blindedOwner.buffer);
            h.update(cc.blindingNonce.buffer);
            h.update(cc.magnitude.buffer);
        }
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.claimableHash, this.coinRequests);
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            authorization: this.authorization.toPOD(),
            claimableHash: this.claimableHash.toPOD(),
            coinRequests: this.coinRequests.map(cr => ({
                blindedOwner: cr.blindedOwner.toPOD(),
                blindingNonce: cr.blindingNonce.toPOD(),
                magnitude: cr.magnitude.toPOD(),
            })),
        };
    }
    // how much is being claimed
    amount() {
        let n = 0;
        for (const coinRequest of this.coinRequests) {
            n += coinRequest.magnitude.toAmount();
        }
        return n;
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map