import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import Magnitude from './magnitude';
export interface CoinClaim {
    blindingNonce: PublicKey;
    blindedOwner: BlindedMessage;
    magnitude: Magnitude;
}
export default class ClaimRequest {
    static fromPOD(data: any): ClaimRequest | Error;
    claimHash: Hash;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(claimHash: Hash, coins: CoinClaim[], authorization: Signature);
    static hashOf(claimHash: Hash, coins: CoinClaim[]): Hash;
    hash(): Hash;
    toPOD(): POD.ClaimRequest;
}
