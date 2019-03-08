import ClaimableCoinSet from './claimable-coin-set';
import * as POD from './pod';
import Hookin from './hookin';
import Signature from './signature';
export default class TransferHookinToCoin {
    static fromPOD(data: any): TransferHookinToCoin | Error;
    input: Hookin;
    output: ClaimableCoinSet;
    authorization: Signature;
    constructor(input: Hookin, output: ClaimableCoinSet, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferHookinToCoin;
}
