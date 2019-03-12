import BlindedMessage from './blinded-message';
import ClaimableCoins from './claimable-coins';
import Hash from './hash';
import { Magnitude } from './pod';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
export interface CoinClaim {
    blindingNonce: PublicKey;
    blindedOwner: BlindedMessage;
    magnitude: Magnitude;
}
export default class ClaimRequest {
    static newAuthorized(claimantPrivateKey: PrivateKey, claim: ClaimableCoins, coins: CoinClaim[]): ClaimRequest;
    static fromPOD(data: any): ClaimRequest | Error;
    claim: ClaimableCoins;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(claim: ClaimableCoins, coins: CoinClaim[], authorization: Signature);
    static hashOf(claimableHash: Hash, coins: CoinClaim[]): Hash;
    hash(): Hash;
    toPOD(): POD.ClaimRequest;
}
