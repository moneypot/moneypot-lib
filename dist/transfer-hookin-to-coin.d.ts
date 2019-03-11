import Claimables from './claimable-coins';
import * as POD from './pod';
import Hookin from './hookin';
import Signature from './signature';
export default class TransferHookinToCoin {
    static fromPOD(data: any): TransferHookinToCoin | Error;
    input: Hookin;
    output: Claimables;
    authorization: Signature;
    constructor(input: Hookin, output: Claimables, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferHookinToCoin;
}
