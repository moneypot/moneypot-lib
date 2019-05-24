import Hash from './hash';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
export default class ClaimRequest {
    static newAuthorized(claimHash: Hash, coinsRequestHash: Hash, claimantPrivateKey: PrivateKey): ClaimRequest;
    static fromPOD(data: any): ClaimRequest | Error;
    claimHash: Hash;
    coinsRequestHash: Hash;
    authorization: Signature;
    constructor(claimHash: Hash, coinsRequestHash: Hash, authorization: Signature);
    static hashOf(claimHash: Hash, coinsRequestHash: Hash): Hash;
    hash(): Hash;
    toPOD(): POD.ClaimRequest;
}
