import Hash from './hash';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import CoinRequest from './coin-request';
export default class ClaimRequest {
    static newAuthorized(claimHash: Hash, coinRequests: CoinRequest[], claimantPrivateKey: PrivateKey): ClaimRequest;
    static fromPOD(data: any): ClaimRequest | Error;
    claimHash: Hash;
    coinRequests: CoinRequest[];
    authorization: Signature;
    constructor(claimHash: Hash, coinRequests: CoinRequest[], authorization: Signature);
    static hashOf(claimHash: Hash, coinRequests: CoinRequest[]): Hash;
    hash(): Hash;
    toPOD(): POD.ClaimRequest;
}
