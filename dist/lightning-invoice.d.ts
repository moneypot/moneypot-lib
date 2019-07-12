import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
export default class LightningInvoice {
    beneficiary: PublicKey;
    paymentRequest: string;
    constructor(beneficiary: PublicKey, paymentRequest: string);
    hash(): Hash;
    toPOD(): POD.LightningInvoice;
    static fromPOD(data: any): {
        beneficiary: PublicKey;
        paymentRequest: string;
    };
}
