"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const magnitude_1 = require("./magnitude");
class ClaimRequest {
    static newAuthorized(claimHash, coinRequests, claimantPrivateKey) {
        const hash = ClaimRequest.hashOf(claimHash, coinRequests);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(claimHash, coinRequests, authorization);
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimRequest.fromPOD expected an object');
        }
        const claim = hash_1.default.fromPOD(data.claim);
        if (claim instanceof Error) {
            return claim;
        }
        if (Array.isArray(data.coinRequests)) {
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
        return new ClaimRequest(claim, coinRequests, authorization);
    }
    constructor(claimHash, coinRequests, authorization) {
        this.claimHash = claimHash;
        this.coinRequests = coinRequests;
        this.authorization = authorization;
    }
    static hashOf(claimHash, coinRequests) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(claimHash.buffer);
        for (const cc of coinRequests) {
            h.update(cc.blindedOwner.buffer);
            h.update(cc.blindingNonce.buffer);
            h.update(cc.magnitude.buffer);
        }
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.claimHash, this.coinRequests);
    }
    toPOD() {
        return {
            authorization: this.authorization.toPOD(),
            claimHash: this.claimHash.toPOD(),
            coinRequests: this.coinRequests.map(cr => ({
                blindedOwner: cr.blindedOwner.toPOD(),
                blindingNonce: cr.blindingNonce.toPOD(),
                magnitude: cr.magnitude.toPOD(),
            })),
        };
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map