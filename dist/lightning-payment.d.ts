import * as POD from './pod';
import Hash from './hash';
import AbstractTransfer, { TransferData } from './abstract-transfer';
export default class LightningPayment extends AbstractTransfer {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequest: string;
    get kind(): 'LightningPayment';
    constructor(transferData: TransferData, paymentRequest: string);
    toPOD(): POD.LightningPayment;
    static hashOf(transferDataHash: Hash, paymentRequest: string): Hash;
    hash(): Hash;
}
