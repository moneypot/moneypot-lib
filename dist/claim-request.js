"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const claimable_coin_1 = require("./claimable-coin");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
// represents a claim request
class ClaimRequest {
    static newAuthorized(claimantPrivateKey, magnitude, blindingNonce, blindedOwner) {
        const pubkey = claimantPrivateKey.toPublicKey();
        const coin = new claimable_coin_1.default(pubkey, magnitude);
        const hash = ClaimRequest.hashOf(coin.hash(), blindingNonce, blindedOwner);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(coin, blindingNonce, blindedOwner, authorization);
    }
    static fromPOD(data) {
        const coin = claimable_coin_1.default.fromPOD(data.coin);
        if (coin instanceof Error) {
            return coin;
        }
        const blindNonce = public_key_1.default.fromBech(data.blindingNonce);
        if (blindNonce instanceof Error) {
            return blindNonce;
        }
        const blindedOwner = blinded_message_1.default.fromBech(data.blindedOwner);
        if (blindedOwner instanceof Error) {
            return blindedOwner;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new ClaimRequest(coin, blindNonce, blindedOwner, authorization);
    }
    constructor(coin, blindingNonce, blindedOwner, authorization) {
        this.coin = coin;
        this.blindingNonce = blindingNonce;
        this.blindedOwner = blindedOwner;
        this.authorization = authorization;
    }
    static hashOf(coinHash, blindingNonce, blindedOwner) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(coinHash.buffer);
        h.update(blindingNonce.buffer);
        h.update(blindedOwner.buffer);
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.coin.hash(), this.blindingNonce, this.blindedOwner);
    }
    isAuthorized() {
        return this.authorization.verify((this.hash()).buffer, this.coin.claimant);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            blindedOwner: this.blindedOwner.toBech(),
            blindingNonce: this.blindingNonce.toBech(),
            coin: this.coin.toPOD(),
        };
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map