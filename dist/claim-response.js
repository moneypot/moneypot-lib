"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blinded_signature_1 = require("./blinded-signature");
const hash_1 = require("./hash");
class ClaimResponse {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            throw new Error('ClaimResponse must be an object');
        }
        const claimRequest = hash_1.default.fromBech(data.claimRequestHash);
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
    constructor(claimRequestHash, blindedExistenceProofs) {
        this.claimRequestHash = claimRequestHash;
        this.blindedExistenceProofs = blindedExistenceProofs;
    }
    hash() {
        const h = hash_1.default.newBuilder('ClaimResponse');
        h.update(this.claimRequestHash.buffer);
        for (const blindedExistenceProof of this.blindedExistenceProofs) {
            h.update(blindedExistenceProof.buffer);
        }
        return h.digest();
    }
    toPOD() {
        return {
            blindedExistenceProofs: this.blindedExistenceProofs.map(x => x.toBech()),
            claimRequestHash: this.claimRequestHash.toBech(),
        };
    }
}
exports.default = ClaimResponse;
//# sourceMappingURL=claim-response.js.map