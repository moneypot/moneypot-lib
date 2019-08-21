import BlindedSignature from '../blinded-signature';
import ClaimRequest from '../claim-request';
import Hash from '../hash';
import * as POD from '../pod';
export default class Claimed {
    claimRequest: ClaimRequest;
    blindedReceipts: BlindedSignature[];
    constructor(claimRequest: ClaimRequest, blindedReceipts: BlindedSignature[]);
    hash(): Hash;
    toPOD(): POD.Status.Claimed;
    static fromPOD(data: any): Claimed | Error;
}
