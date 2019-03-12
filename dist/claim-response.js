"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_signature_1 = require("./blinded-signature");
const claim_request_1 = require("./claim-request");
const hash_1 = require("./hash");
// The response embeds the request, to make it easier to store/verify
class ClaimResponse {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            throw new Error('ClaimResponse must be an object');
        }
        const claimRequest = claim_request_1.default.fromPOD(data.claimRequest);
        if (claimRequest instanceof Error) {
            return claimRequest;
        }
        if (!Array.isArray(data.blindedExistenceProofs)) {
            return new Error('expected blindedExistenceProofs in ClaimResponse to be an array');
        }
        const blindedExistenceProofs = [];
        for (const bep of data.blindedExistenceProofs) {
            const blindedExistenceProof = blinded_signature_1.default.fromBech(bep);
            if (blindedExistenceProof instanceof Error) {
                return blindedExistenceProof;
            }
            blindedExistenceProofs.push(blindedExistenceProof);
        }
        return new ClaimResponse(claimRequest, blindedExistenceProofs);
    }
    constructor(claimRequest, blindedExistenceProofs) {
        this.claimRequest = claimRequest;
        this.blindedExistenceProofs = blindedExistenceProofs;
    }
    hash() {
        const h = hash_1.default.newBuilder('ClaimResponse');
        h.update(this.claimRequest.hash().buffer);
        for (const blindedExistenceProof of this.blindedExistenceProofs) {
            h.update(blindedExistenceProof.buffer);
        }
        return h.digest();
    }
    toPOD() {
        return {
            blindedExistenceProofs: this.blindedExistenceProofs.map(x => x.toBech()),
            claimRequest: this.claimRequest.toPOD(),
        };
    }
}
exports.default = ClaimResponse;
//# sourceMappingURL=claim-response.js.map