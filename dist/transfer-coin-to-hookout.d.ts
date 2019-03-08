import Signature from './signature';
import * as POD from './pod';
import ClaimedCoinSet from './claimed-coin-set';
import Hookout from './hookout';
export default class TransferCoinToHookout {
    static fromPOD(data: any): TransferCoinToHookout | Error;
    input: ClaimedCoinSet;
    output: Hookout;
    authorization: Signature;
    constructor(input: ClaimedCoinSet, output: Hookout, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferCoinToHookout;
}
