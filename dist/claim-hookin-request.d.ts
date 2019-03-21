import Hookin from './hookin';
import Hash from './hash';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import ClaimRequest, { CoinClaim } from './claim-request';
export default class ClaimHookinRequest {
    static newAuthorized(claimantPrivateKey: PrivateKey, claim: Hookin, coins: CoinClaim[]): ClaimHookinRequest;
    static fromPOD(data: any): ClaimHookinRequest | Error;
    claim: Hookin;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(claim: Hookin, coins: CoinClaim[], authorization: Signature);
    prune(): ClaimRequest;
    hash(): Hash;
    toPOD(): POD.ClaimHookinRequest;
}
