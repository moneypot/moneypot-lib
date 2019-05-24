import Hash from './hash';
import * as POD from './pod';
import CoinRequest from './coin-request';
export default class CoinsRequest {
    static fromPOD(data: any): CoinsRequest | Error;
    coinRequest: CoinRequest[];
    constructor(coinClaims: CoinRequest[]);
    static hashOf(coinClaims: CoinRequest[]): Hash;
    hash(): Hash;
    toPOD(): POD.CoinsRequest;
}
