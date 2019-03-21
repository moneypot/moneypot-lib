import Bounty from './bounty';
import Hash from './hash';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import ClaimRequest, { CoinClaim } from './claim-request';
export default class ClaimBountyRequest {
    static newAuthorized(claimantPrivateKey: PrivateKey, claim: Bounty, coins: CoinClaim[]): ClaimBountyRequest;
    static fromPOD(data: any): ClaimBountyRequest | Error;
    claim: Bounty;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(claim: Bounty, coins: CoinClaim[], authorization: Signature);
    prune(): ClaimRequest;
    hash(): Hash;
    toPOD(): POD.ClaimBountyRequest;
}
