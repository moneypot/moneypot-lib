import * as POD from './pod';
import Hash from './hash';
import Abstract, { TransferData } from './abstract-transfer';
export default class LightningPayment extends Abstract {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequest: string;
    readonly kind: 'LightningPayment';
    constructor(transferData: TransferData, paymentRequest: string);
    toPOD(): POD.LightningPayment;
    hash(): Hash;
}
