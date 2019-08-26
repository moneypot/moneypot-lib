import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
import AbstractClaimable from './abstract-claimable';
export default class LightningInvoice implements AbstractClaimable {
    claimant: PublicKey;
    paymentRequest: string;
    constructor(claimant: PublicKey, paymentRequest: string);
    hash(): Hash;
    toPOD(): POD.LightningInvoice;
    readonly fee: number;
    readonly amount: number;
    readonly kind: 'LightningInvoice';
    static fromPOD(data: any): Error | LightningInvoice;
}
