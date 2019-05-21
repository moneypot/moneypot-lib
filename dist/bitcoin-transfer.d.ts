import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import { Hookout } from '.';
import Change from './change';
import Transfer from './transfer';
export default class BitcoinTransfer {
    static fromPOD(data: any): BitcoinTransfer | Error;
    readonly inputs: ReadonlyArray<Coin>;
    readonly output: Hookout;
    readonly change: Change;
    authorization: Signature;
    constructor(inputs: ReadonlyArray<Coin>, output: Hookout, change: Change, authorization: Signature);
    hash(): Hash;
    toPOD(): POD.BitcoinTransfer;
    fee(): number;
    inputAmount(): number;
    isValid(): boolean;
    prune(): Transfer;
}
