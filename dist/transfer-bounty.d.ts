import Bounty from './bounty';
import CoinSet from './coin-set';
import * as POD from './pod';
import Signature from './signature';
export default class TransferBounty {
    static fromPOD(data: any): TransferBounty | Error;
    input: CoinSet;
    output: Bounty;
    authorization: Signature;
    constructor(input: CoinSet, output: Bounty, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferBounty;
}
