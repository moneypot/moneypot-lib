import ClaimableCoinSet from './claimable-coin-set';
import ClaimedCoinSet from './claimed-coin-set';
import * as POD from './pod';
import Signature from './signature';
export default class TransferCoinToCoin {
    static fromPOD(data: any): TransferCoinToCoin | Error;
    input: ClaimedCoinSet;
    output: ClaimableCoinSet;
    authorization: Signature;
    constructor(input: ClaimedCoinSet, output: ClaimableCoinSet, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferCoinToCoin;
}
