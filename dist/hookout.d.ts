import * as POD from './pod';
import Hash from './hash';
import Transfer, { TransferData } from './transfer';
export declare type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
export default class Hookout extends Transfer {
    static fromPOD(data: any): Hookout | Error;
    bitcoinAddress: string;
    priority: Priority;
    constructor(td: TransferData, bitcoinAddress: string, priority: Priority);
    toPOD(): POD.Hookout;
    hash(): Hash;
}
