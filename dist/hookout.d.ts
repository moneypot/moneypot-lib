import * as POD from './pod';
import Hash from './hash';
export declare type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
export default class Hookout {
    static fromPOD(data: any): Hookout | Error;
    amount: POD.Amount;
    bitcoinAddress: string;
    priority: Priority;
    fee: POD.Amount;
    nonce: Uint8Array;
    constructor(amount: POD.Amount, bitcoinAddress: string, priority: Priority, fee: POD.Amount, nonce: Uint8Array);
    toPOD(): POD.Hookout;
    hash(): Hash;
}
