import ClaimableCoins from './claimable-coins';
import ClaimedCoinSet from './claimed-coin-set';
import * as POD from './pod';
import Signature from './signature';
export default class TransferCoinToCoin {
    static fromPOD(data: any): TransferCoinToCoin | Error;
    input: ClaimedCoinSet;
    output: ClaimableCoins;
    authorization: Signature;
    constructor(input: ClaimedCoinSet, output: ClaimableCoins, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferCoinToCoin;
}
