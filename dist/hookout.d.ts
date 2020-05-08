import * as POD from './pod';
import Hash from './hash';
import AbstractTransfer, { TransferData } from './abstract-transfer';
export declare type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
export default class Hookout extends AbstractTransfer {
    static fromPOD(data: any): Hookout | Error;
    rbf: boolean;
    bitcoinAddress: string;
    priority: Priority;
    get kind(): 'Hookout';
    constructor(td: TransferData, bitcoinAddress: string, priority: Priority, rbf: boolean);
    toPOD(): POD.Hookout;
    static hashOf(transferDataHash: Hash, bitcoinAddress: string, priority: Priority): Hash;
    hash(): Hash;
}
