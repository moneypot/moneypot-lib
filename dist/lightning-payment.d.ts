import Hash from './hash';
import * as bolt11 from './bolt11';
export default class LightningPayment {
    static fromPOD(data: any): LightningPayment | Error;
    paymentRequestObject: bolt11.PaymentRequestObject;
    constructor(paymentRequestObject: bolt11.PaymentRequestObject);
    toPOD(): string;
    hash(): Hash;
    static hashOf(paymentRequest: string): Hash;
}
