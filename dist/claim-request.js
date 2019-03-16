"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const bounty_1 = require("./bounty");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const POD = require("./pod");
const Buffutils = require("./util/buffutils");
class ClaimRequest {
    static newAuthorized(claimantPrivateKey, bounty, coins) {
        const hash = ClaimRequest.hashOf(bounty.hash(), coins);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(bounty, coins, authorization);
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimRequest.fromPOD expected an object');
        }
        const bounty = bounty_1.default.fromPOD(data.bounty);
        if (bounty instanceof Error) {
            return bounty;
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
        return new ClaimRequest(bounty, coins, authorization);
    }
    constructor(bounty, coins, authorization) {
        this.bounty = bounty;
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
        return ClaimRequest.hashOf(this.bounty.hash(), this.coins);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            bounty: this.bounty.toPOD(),
            coins: this.coins.map(coin => ({
                blindingNonce: coin.blindingNonce.toBech(),
                blindedOwner: coin.blindedOwner.toBech(),
                magnitude: coin.magnitude,
            })),
        };
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map