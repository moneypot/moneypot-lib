import BlindedSignature from './blinded-signature';
import ClaimRequest from './claim-request';
import Hash from './hash';
export default class ClaimResponse {
    static fromPOD(data) {
        const claimRequest = ClaimRequest.fromPOD(data.claimRequest);
        if (claimRequest instanceof Error) {
            return claimRequest;
        }
        const blindedExistenceProof = BlindedSignature.fromBech(data.blindedExistenceProof);
        if (blindedExistenceProof instanceof Error) {
            return blindedExistenceProof;
        }
        return new ClaimResponse(claimRequest, blindedExistenceProof);
    }
    constructor(claimRequest, blindedExistenceProof) {
        this.claimRequest = claimRequest;
        this.blindedExistenceProof = blindedExistenceProof;
    }
    async hash() {
        const h = Hash.newBuilder('ClaimResponse');
        h.update((await this.claimRequest.hash()).buffer);
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
//# sourceMappingURL=claim-response.js.map