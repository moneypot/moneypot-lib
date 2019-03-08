import ClaimableCoinSet from './claimable-coin-set';
import * as POD from './pod';
import SpentCoinSet from './spent-coin-set';
export default class TransferCoinToCoin {
    static fromPOD(data: any): TransferCoinToCoin | Error;
    input: SpentCoinSet;
    output: ClaimableCoinSet;
    constructor(input: SpentCoinSet, output: ClaimableCoinSet);
    hash(): import("./hash").default;
    toPOD(): POD.TransferCoinToCoin;
}
