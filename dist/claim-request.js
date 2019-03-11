"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const claimable_coins_1 = require("./claimable-coins");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const POD = require("./pod");
const Buffutils = require("./util/buffutils");
class ClaimRequest {
    static newAuthorized(claimantPrivateKey, amount, coins) {
        const pubkey = claimantPrivateKey.toPublicKey();
        const claimable = new claimable_coins_1.default(amount, pubkey);
        const hash = ClaimRequest.hashOf(claimable.hash(), coins);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(claimable, coins, authorization);
    }
    static fromPOD(data) {
        const claim = claimable_coins_1.default.fromPOD(data.claim);
        if (claim instanceof Error) {
            return claim;
        }
        if (!Array.isArray(data.coins)) {
            return new Error('ClaimRequest expected an array of coins');
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
            const magnitude = coin.magnitude;
            if (!POD.isMagnitude(magnitude)) {
                return new Error('all coins must have a magnitude in ClaimRequest');
            }
            coins.push({ blindingNonce, blindedOwner, magnitude });
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new ClaimRequest(claim, [], authorization);
    }
    constructor(claim, coins, authorization) {
        this.claim = claim;
        this.coins = coins;
        this.authorization = authorization;
    }
    static hashOf(claimableHash, coins) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(claimableHash.buffer);
        for (const coin of coins) {
            h.update(coin.blindedOwner.buffer);
            h.update(coin.blindingNonce.buffer);
            h.update(Buffutils.fromUint8(coin.magnitude));
        }
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.claim.hash(), this.coins);
    }
    isAuthorized() {
        return this.authorization.verify(this.hash().buffer, this.claim.claimant);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            claim: this.claim.toPOD(),
            coins: this.coins.map(coin => ({
                blindingNonce: coin.blindingNonce.toBech(),
                blindedOwner: coin.blindedOwner.toBech(),
                magnitude: coin.magnitude
            })),
        };
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map