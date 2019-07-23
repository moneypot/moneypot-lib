import * as POD from './pod';
import Hash from './hash';
export default class LightningPayment {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequest: string;
    amount: number;
    constructor(paymentRequest: string, amount: number);
    toPOD(): POD.LightningPayment;
    hash(): Hash;
    static hashOf(paymentRequest: string, amount: number): Hash;
}
