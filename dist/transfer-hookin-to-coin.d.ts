import ClaimableCoinSet from './claimable-coin-set';
import Hash from './hash';
import * as POD from './pod';
import SpentHookin from './spent-hookin';
export default class TransferHookinToCoin {
    static fromPOD(data: any): TransferHookinToCoin | Error;
    input: SpentHookin;
    output: ClaimableCoinSet;
    constructor(input: SpentHookin, output: ClaimableCoinSet);
    hash(): Promise<Hash>;
    toPOD(): POD.TransferHookinToCoin;
}
