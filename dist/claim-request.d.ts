import BlindedMessage from './blinded-message';
import Hash from './hash';
import { Magnitude } from './pod';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
export interface CoinClaim {
    blindingNonce: PublicKey;
    blindedOwner: BlindedMessage;
    magnitude: Magnitude;
}
export default class ClaimRequest {
    static fromPOD(data: any): ClaimRequest | Error;
    claim: Hash;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(claim: Hash, coins: CoinClaim[], authorization: Signature);
    static hashOf(claim: Hash, coins: CoinClaim[]): Hash;
    hash(): Hash;
    toPOD(): POD.ClaimRequest;
}
