import BlindedSignature from './blinded-signature';
import Hash from './hash';
import * as POD from './pod';
export default class ClaimResponse {
    static fromPOD(data: any): ClaimResponse | Error;
    claimRequestHash: Hash;
    blindedExistenceProofs: BlindedSignature[];
    constructor(claimRequestHash: Hash, blindedExistenceProofs: BlindedSignature[]);
    hash(): Hash;
    toPOD(): POD.ClaimResponse;
}
