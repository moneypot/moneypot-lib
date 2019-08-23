import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
export default class LightningPaymentSent extends AbstractStatus {
    paymentPreimage: Uint8Array;
    totalFees: number;
    constructor(claimableHash: Hash, paymentPreimage: Uint8Array, totalFees: number);
    hash(): Hash;
    toPOD(): POD.Status.LightningPaymentSent;
    static fromPOD(obj: any): LightningPaymentSent | Error;
}
