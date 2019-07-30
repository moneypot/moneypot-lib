import * as POD from './pod';
import Hash from './hash';
export default class LightningPayment {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequest: string;
    amount: number;
    feeLimit: number;
    constructor(paymentRequest: string, amount: POD.Amount, feeLimit: POD.Amount);
    toPOD(): POD.LightningPayment;
    hash(): Hash;
    static hashOf(paymentRequest: string, amount: POD.Amount, feeLimit: POD.Amount): Hash;
}
