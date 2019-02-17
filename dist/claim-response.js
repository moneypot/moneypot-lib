"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_signature_1 = require("./blinded-signature");
const claim_request_1 = require("./claim-request");
const hash_1 = require("./hash");
class ClaimResponse {
    static fromPOD(data) {
        const claimRequest = claim_request_1.default.fromPOD(data.claimRequest);
        if (claimRequest instanceof Error) {
            return claimRequest;
        }
        const blindedExistenceProof = blinded_signature_1.default.fromBech(data.blindedExistenceProof);
        if (blindedExistenceProof instanceof Error) {
            return blindedExistenceProof;
        }
        return new ClaimResponse(claimRequest, blindedExistenceProof);
    }
    constructor(claimRequest, blindedExistenceProof) {
        this.claimRequest = claimRequest;
        this.blindedExistenceProof = blindedExistenceProof;
    }
    hash() {
        const h = hash_1.default.newBuilder('ClaimResponse');
        h.update(this.claimRequest.hash().buffer);
        h.update(this.blindedExistenceProof.buffer);
        return h.digest();
    }
    toPOD() {
        return {
            blindedExistenceProof: this.blindedExistenceProof.toBech(),
            claimRequest: this.claimRequest.toPOD(),
        };
    }
}
exports.default = ClaimResponse;
//# sourceMappingURL=claim-response.js.map