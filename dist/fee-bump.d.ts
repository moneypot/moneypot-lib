import * as POD from './pod';
import Hash from './hash';
import AbstractTransfer, { TransferData } from './abstract-transfer';
export default class FeeBump extends AbstractTransfer {
    static fromPOD(data: any): FeeBump | Error;
    txid: Uint8Array;
    confTarget: number;
    get kind(): 'FeeBump';
    constructor(transferData: TransferData, txid: Uint8Array, confTarget: number);
    toPOD(): POD.FeeBump;
    static hashOf(transferHash: Hash, txid: Uint8Array, confTarget: number): Hash;
    hash(): Hash;
}
