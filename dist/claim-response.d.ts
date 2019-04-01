import BlindedSignature from './blinded-signature';
import ClaimRequest from './claim-request';
import Hash from './hash';
import * as POD from './pod';
export default class ClaimResponse {
    static fromPOD(data: any): ClaimResponse | Error;
    claimRequest: ClaimRequest;
    blindedReceipts: BlindedSignature[];
    constructor(claimRequest: ClaimRequest, blindedReceipts: BlindedSignature[]);
    hash(): Hash;
    toPOD(): POD.ClaimResponse;
}
