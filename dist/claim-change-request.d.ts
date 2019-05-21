import Change from './change';
import Hash from './hash';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import ClaimRequest, { CoinClaim } from './claim-request';
export default class ClaimChangeRequest {
    static newAuthorized(claimantPrivateKey: PrivateKey, claim: Change, coins: CoinClaim[]): ClaimChangeRequest;
    static fromPOD(data: any): ClaimChangeRequest | Error;
    claim: Change;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(claim: Change, coins: CoinClaim[], authorization: Signature);
    prune(): ClaimRequest;
    hash(): Hash;
    toPOD(): POD.ClaimChangeRequest;
    verify(): boolean;
}
