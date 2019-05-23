"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const magnitude_1 = require("./magnitude");
class CoinsRequest {
    static fromPOD(data) {
        if (Array.isArray(data)) {
            return new Error('CoinClaims.fromPOD expected an array');
        }
        const coinClaims = [];
        for (const coin of data) {
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
            coinClaims.push({ blindingNonce, blindedOwner, magnitude });
        }
        return new CoinsRequest(coinClaims);
    }
    constructor(coinClaims) {
        this.coinRequest = coinClaims;
    }
    static hashOf(coinClaims) {
        const h = hash_1.default.newBuilder('CoinsRequest');
        for (const cc of coinClaims) {
            h.update(cc.blindedOwner.buffer);
            h.update(cc.blindingNonce.buffer);
            h.update(cc.magnitude.buffer);
        }
        return h.digest();
    }
    hash() {
        return CoinsRequest.hashOf(this.coinRequest);
    }
    toPOD() {
        return this.coinRequest.map(coin => ({
            blindingNonce: coin.blindingNonce.toPOD(),
            blindedOwner: coin.blindedOwner.toPOD(),
            magnitude: coin.magnitude.toPOD(),
        }));
    }
}
exports.default = CoinsRequest;
//# sourceMappingURL=coins-request.js.map