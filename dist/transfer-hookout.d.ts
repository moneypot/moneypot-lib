import Signature from './signature';
import * as POD from './pod';
import CoinSet from './coin-set';
import Hookout from './hookout';
export default class TransferHookout {
    static fromPOD(data: any): TransferHookout | Error;
    input: CoinSet;
    output: Hookout;
    authorization: Signature;
    constructor(input: CoinSet, output: Hookout, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferHookout;
}
