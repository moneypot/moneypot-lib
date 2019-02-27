import ClaimedCoin from './claimed-coin';
import ClaimedCoinSet from './claimed-coin-set';
import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
export default class SpentCoinSet {
    static fromPOD(data: any): SpentCoinSet | Error;
    readonly coins: ClaimedCoinSet;
    readonly spendAuthorization: Signature[];
    constructor(coins: ClaimedCoinSet, authorization: Signature[]);
    isAuthorizedFor(message: Uint8Array): boolean;
    [Symbol.iterator](): IterableIterator<ClaimedCoin>;
    readonly amount: number;
    get(n: number): ClaimedCoin;
    readonly length: number;
    toPOD(): POD.SpentCoinSet;
    hash(): Promise<Hash>;
}
