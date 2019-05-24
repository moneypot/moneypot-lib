"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const signature_1 = require("./signature");
class ClaimRequest {
    static newAuthorized(claimHash, coinsRequestHash, claimantPrivateKey) {
        const hash = ClaimRequest.hashOf(claimHash, coinsRequestHash);
        const authorization = signature_1.default.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(claimHash, coinsRequestHash, authorization);
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimRequest.fromPOD expected an object');
        }
        const claim = hash_1.default.fromPOD(data.claim);
        if (claim instanceof Error) {
            return claim;
        }
        const coinsRequestHash = hash_1.default.fromPOD(data.coinsRequestHash);
        if (coinsRequestHash instanceof Error) {
            return coinsRequestHash;
        }
        const authorization = signature_1.default.fromPOD(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new ClaimRequest(claim, coinsRequestHash, authorization);
    }
    constructor(claimHash, coinsRequestHash, authorization) {
        this.claimHash = claimHash;
        this.coinsRequestHash = coinsRequestHash;
        this.authorization = authorization;
    }
    static hashOf(claimHash, coinsRequestHash) {
        const h = hash_1.default.newBuilder('ClaimRequest');
        h.update(claimHash.buffer);
        h.update(coinsRequestHash.buffer);
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.claimHash, this.coinsRequestHash);
    }
    toPOD() {
        return {
            authorization: this.authorization.toPOD(),
            claimHash: this.claimHash.toPOD(),
            coinsRequestHash: this.coinsRequestHash.toPOD(),
        };
    }
}
exports.default = ClaimRequest;
//# sourceMappingURL=claim-request.js.map