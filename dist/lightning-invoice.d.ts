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
    get fee(): number;
    get amount(): number;
    get claimableAmount(): number;
    get kind(): 'LightningInvoice';
    static fromPOD(data: any): Error | LightningInvoice;
}
