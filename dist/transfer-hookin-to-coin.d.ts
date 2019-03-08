import ClaimableCoinSet from './claimable-coin-set';
import * as POD from './pod';
import SpentHookin from './spent-hookin';
export default class TransferHookinToCoin {
    static fromPOD(data: any): TransferHookinToCoin | Error;
    input: SpentHookin;
    output: ClaimableCoinSet;
    constructor(input: SpentHookin, output: ClaimableCoinSet);
    hash(): import("./hash").default;
    toPOD(): POD.TransferHookinToCoin;
}
