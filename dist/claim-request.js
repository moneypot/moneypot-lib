"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_message_1 = require("./blinded-message");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const POD = require("./pod");
const magnitude_1 = require("./magnitude");
const buffutils = require("./util/buffutils");
class ClaimRequest {
    constructor(claimableHash, coinRequests, authorization, fee) {
        this.claimableHash = claimableHash;
        this.coinRequests = coinRequests;
        this.authorization = authorization;
        this.fee = fee;
    }
    static newAuthorized(claimableHash, coinRequests, claimantPrivateKey, fee) {
        const hash = ClaimRequest.hashOf(claimableHash, coinRequests, fee);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(claimableHash, coinRequests, authorization, fee);
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
        const fee = data.fee;
        if (!POD.isAmount(fee)) {
            return new Error(`${fee} is not a number.`);
        }
        return new ClaimRequest(claimableHash, coinRequests, authorization, fee);
    }
    static hashOf(claimableHash, coinRequests, fee) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(claimableHash.buffer);
        for (const cc of coinRequests) {
            h.update(cc.blindedOwner.buffer);
            h.update(cc.blindingNonce.buffer);
            h.update(cc.magnitude.buffer);
        }
        h.update(buffutils.fromUint64(fee));
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.claimableHash, this.coinRequests, this.fee);
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
            fee: this.fee,
        };
    }
    // how much is being claimed
    amount() {
        let n = this.fee;
        for (const coinRequest of this.coinRequests) {
            n += coinRequest.magnitude.toAmount();
        }
        return n;
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map