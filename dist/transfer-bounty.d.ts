import Bounty from './bounty';
import ClaimedCoinSet from './claimed-coin-set';
import * as POD from './pod';
import Signature from './signature';
export default class TransferBounty {
    static fromPOD(data: any): TransferBounty | Error;
    input: ClaimedCoinSet;
    output: Bounty;
    authorization: Signature;
    constructor(input: ClaimedCoinSet, output: Bounty, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferBounty;
}
