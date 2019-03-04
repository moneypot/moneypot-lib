import ClaimedCoin from './claimed-coin';
import Hash from './hash';
import * as POD from './pod';
export default class ClaimedCoinSet {
    static fromPOD(data: any): ClaimedCoinSet | Error;
    readonly coins: ClaimedCoin[];
    constructor(inputs: ClaimedCoin[]);
    [Symbol.iterator](): IterableIterator<ClaimedCoin>;
    readonly amount: number;
    get(n: number): ClaimedCoin;
    canonicalize(): void;
    readonly length: number;
    toPOD(): POD.ClaimedCoinSet;
    hash(): Hash;
    private isCanonicalized;
}
