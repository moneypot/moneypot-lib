import BlindedSignature from './blinded-signature';
import ClaimRequest from './claim-request';
import Hash from './hash';
import * as POD from './pod';
export default class ClaimResponse {
    static fromPOD(data: any): ClaimResponse | Error;
    blindedExistenceProof: BlindedSignature;
    claimRequest: ClaimRequest;
    constructor(claimRequest: ClaimRequest, blindedExistenceProof: BlindedSignature);
    hash(): Promise<Hash>;
    toPOD(): POD.ClaimResponse;
}
