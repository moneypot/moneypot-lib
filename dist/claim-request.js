"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const magnitude_1 = require("./magnitude");
class ClaimRequest {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimRequest.fromPOD expected an object');
        }
        const claim = hash_1.default.fromPOD(data.claim);
        if (claim instanceof Error) {
            return claim;
        }
        if (!Array.isArray(data.coins)) {
            return new Error('ClaimRequest expected an array of coins');
        }
        const coins = [];
        for (const coin of data.coins) {
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
            coins.push({ blindingNonce, blindedOwner, magnitude });
        }
        const authorization = signature_1.default.fromPOD(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new ClaimRequest(claim, coins, authorization);
    }
    constructor(claimHash, coins, authorization) {
        this.claimHash = claimHash;
        this.coins = coins;
        this.authorization = authorization;
    }
    static hashOf(claimHash, coins) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(claimHash.buffer);
        for (const coin of coins) {
            h.update(coin.blindedOwner.buffer);
            h.update(coin.blindingNonce.buffer);
            h.update(coin.magnitude.buffer);
        }
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.claimHash, this.coins);
    }
    toPOD() {
        return {
            authorization: this.authorization.toPOD(),
            claimHash: this.claimHash.toPOD(),
            coins: this.coins.map(coin => ({
                blindingNonce: coin.blindingNonce.toPOD(),
                blindedOwner: coin.blindedOwner.toPOD(),
                magnitude: coin.magnitude.toPOD(),
            })),
        };
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map