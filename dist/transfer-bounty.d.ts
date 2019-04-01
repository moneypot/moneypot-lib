import Bounty from './bounty';
import CoinSet from './coin-set';
import * as POD from './pod';
import Signature from './signature';
import Transfer from './transfer';
export default class TransferBounty {
    static fromPOD(data: any): TransferBounty | Error;
    input: CoinSet;
    output: Bounty;
    authorization: Signature;
    constructor(input: CoinSet, output: Bounty, authorization: Signature);
    prune(): Transfer;
    hash(): import("./hash").default;
    toPOD(): POD.TransferBounty;
    isValid(): boolean;
}
