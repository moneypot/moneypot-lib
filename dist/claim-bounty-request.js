"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const bounty_1 = require("./bounty");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const magnitude_1 = require("./magnitude");
const claim_request_1 = require("./claim-request");
class ClaimBountyRequest {
    static newAuthorized(claimantPrivateKey, claim, coins) {
        const hash = claim_request_1.default.hashOf(claim.hash(), coins);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimBountyRequest(claim, coins, authorization);
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimBountyRequest.fromPOD expected an object');
        }
        const claim = bounty_1.default.fromPOD(data.claim);
        if (claim instanceof Error) {
            return claim;
        }
        if (!Array.isArray(data.coins)) {
            return new Error('ClaimBountyRequest expected an array of coins');
        }
        const coins = [];
        for (const coin of data.coins) {
            const blindingNonce = public_key_1.default.fromBech(coin.blindingNonce);
            if (blindingNonce instanceof Error) {
                return blindingNonce;
            }
            const blindedOwner = blinded_message_1.default.fromBech(coin.blindedOwner);
            if (blindedOwner instanceof Error) {
                return blindedOwner;
            }
            const magnitude = magnitude_1.default.fromPOD(coin.magnitude);
            if (magnitude instanceof Error) {
                return magnitude;
            }
            coins.push({ blindingNonce, blindedOwner, magnitude });
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new ClaimBountyRequest(claim, coins, authorization);
    }
    constructor(claim, coins, authorization) {
        this.claim = claim;
        this.coins = coins;
        this.authorization = authorization;
    }
    prune() {
        return new claim_request_1.default(this.claim.hash(), this.coins, this.authorization);
    }
    hash() {
        return claim_request_1.default.hashOf(this.claim.hash(), this.coins);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            claim: this.claim.toPOD(),
            coins: this.coins.map(coin => ({
                blindingNonce: coin.blindingNonce.toBech(),
                blindedOwner: coin.blindedOwner.toBech(),
                magnitude: coin.magnitude.toPOD(),
            })),
        };
    }
}
exports.default = ClaimBountyRequest;
//# sourceMappingURL=claim-bounty-request.js.map