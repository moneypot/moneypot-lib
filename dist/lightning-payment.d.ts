import * as POD from './pod';
import Hash from './hash';
import Transfer, { TransferData } from './transfer';
export default class LightningPayment extends Transfer {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequest: string;
    constructor(transferData: TransferData, paymentRequest: string);
    toPOD(): POD.LightningPayment;
    hash(): Hash;
}
