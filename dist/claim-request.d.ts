import BlindedMessage from './blinded-message';
import Bounty from './bounty';
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
    static newAuthorized(claimantPrivateKey: PrivateKey, bounty: Bounty, coins: CoinClaim[]): ClaimRequest;
    static fromPOD(data: any): ClaimRequest | Error;
    bounty: Bounty;
    coins: CoinClaim[];
    authorization: Signature;
    constructor(bounty: Bounty, coins: CoinClaim[], authorization: Signature);
    static hashOf(claimableHash: Hash, coins: CoinClaim[]): Hash;
    hash(): Hash;
    toPOD(): POD.ClaimRequest;
}
