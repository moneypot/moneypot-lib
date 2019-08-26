import * as POD from './pod';
import Hash from './hash';
import AbstractTransfer, { TransferData } from './abstract-transfer';
export declare type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
export default class Hookout extends AbstractTransfer {
    static fromPOD(data: any): Hookout | Error;
    bitcoinAddress: string;
    priority: Priority;
    readonly kind: 'Hookout';
    constructor(td: TransferData, bitcoinAddress: string, priority: Priority);
    toPOD(): POD.Hookout;
    hash(): Hash;
}
