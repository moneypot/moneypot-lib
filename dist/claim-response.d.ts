import BlindedSignature from './blinded-signature';
import ClaimRequest from './claim-request';
import Hash from './hash';
import * as POD from './pod';
export default class ClaimResponse {
    static fromPOD(data: any): ClaimResponse | Error;
    claimRequest: ClaimRequest;
    blindedExistenceProofs: BlindedSignature[];
    constructor(claimRequest: ClaimRequest, blindedExistenceProofs: BlindedSignature[]);
    hash(): Hash;
    toPOD(): POD.ClaimResponse;
}
