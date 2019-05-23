import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
import Magnitude from './magnitude';
export interface CoinRequest {
    blindingNonce: PublicKey;
    blindedOwner: BlindedMessage;
    magnitude: Magnitude;
}
export default class CoinsRequest {
    static fromPOD(data: any): CoinsRequest | Error;
    coinRequest: CoinRequest[];
    constructor(coinClaims: CoinRequest[]);
    static hashOf(coinClaims: CoinRequest[]): Hash;
    hash(): Hash;
    toPOD(): POD.CoinsRequest;
}
