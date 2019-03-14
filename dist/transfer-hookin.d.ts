import Bounty from './bounty';
import * as POD from './pod';
import Hookin from './hookin';
import Signature from './signature';
export default class TransferHookin {
    static fromPOD(data: any): TransferHookin | Error;
    input: Hookin;
    output: Bounty;
    authorization: Signature;
    constructor(input: Hookin, output: Bounty, authorization: Signature);
    hash(): import("./hash").default;
    toPOD(): POD.TransferHookin;
}
