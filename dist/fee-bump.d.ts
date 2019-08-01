import * as POD from './pod';
import Hash from './hash';
import Transfer, { TransferData } from './transfer';
export default class FeeBump extends Transfer {
    static fromPOD(data: any): FeeBump | Error;
    txid: Uint8Array;
    constructor(transferData: TransferData, txid: Uint8Array);
    toPOD(): POD.FeeBump;
    hash(): Hash;
}
