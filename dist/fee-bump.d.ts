import * as POD from './pod';
import Hash from './hash';
import Abstract, { TransferData } from './abstract-transfer';
export default class FeeBump extends Abstract {
    static fromPOD(data: any): FeeBump | Error;
    txid: Uint8Array;
    readonly kind: 'FeeBump';
    constructor(transferData: TransferData, txid: Uint8Array);
    toPOD(): POD.FeeBump;
    hash(): Hash;
}
