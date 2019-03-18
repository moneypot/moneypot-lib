import Coin from './coin';
import Hash from './hash';
import * as POD from './pod';
export default class CoinSet {
    static fromPOD(data: any): CoinSet | Error;
    readonly coins: Coin[];
    constructor(inputs: Coin[]);
    [Symbol.iterator](): IterableIterator<Coin>;
    readonly amount: number;
    get(n: number): Coin;
    canonicalize(): void;
    readonly length: number;
    toPOD(): POD.CoinSet;
    hash(): Hash;
    private isCanonicalized;
}
