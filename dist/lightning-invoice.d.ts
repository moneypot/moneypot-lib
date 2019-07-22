import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
export default class LightningInvoice {
    claimant: PublicKey;
    paymentRequest: string;
    constructor(claimant: PublicKey, paymentRequest: string);
    hash(): Hash;
    toPOD(): POD.LightningInvoice;
    static fromPOD(data: any): Error | LightningInvoice;
}
