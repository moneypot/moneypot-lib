import ClaimableCoin from './claimable-coin';
import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
export default class ClaimableCoinSet {
    static fromPOD(data: any): ClaimableCoinSet | Error;
    static fromPayTo(creditTo: PublicKey, amount: number): ClaimableCoinSet;
    readonly coins: ClaimableCoin[];
    constructor(outputs: ClaimableCoin[]);
    readonly amount: number;
    readonly length: number;
    [Symbol.iterator](): IterableIterator<ClaimableCoin>;
    private canonicalize;
    private isCanonicalized;
    toPOD(): POD.ClaimableCoin[];
    hash(): Hash;
}
