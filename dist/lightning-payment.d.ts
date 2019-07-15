import Hash from './hash';
export default class LightningPayment {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequest: string;
    amount: number;
    constructor(paymentRequest: string, amount: number);
    toPOD(): {
        paymentRequest: string;
        amount: number;
    };
    hash(): Hash;
    static hashOf(paymentRequest: string, amount: number): Hash;
}
