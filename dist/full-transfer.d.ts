import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import Bounty from './bounty';
import { Hookout } from '.';
import Transfer from './transfer';
export default class FullTransfer {
    static fromPOD(data: any): FullTransfer | Error;
    readonly inputs: ReadonlyArray<Coin>;
    readonly bounties: ReadonlyArray<Bounty>;
    readonly hookout: Hookout | undefined;
    authorization: Signature;
    constructor(inputs: ReadonlyArray<Coin>, bounties: ReadonlyArray<Bounty>, hookout: Hookout | undefined, authorization: Signature);
    hash(): Hash;
    toPOD(): POD.FullTransfer;
    fee(): number;
    inputAmount(): number;
    outputAmount(): number;
    isValid(): boolean;
    prune(): Transfer;
}
