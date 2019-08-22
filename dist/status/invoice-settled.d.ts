import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
export default class InvoiceSettled extends AbstractStatus {
    amount: number;
    rPreimage: Uint8Array;
    time: Date;
    constructor(claimableHash: Hash, amount: number, rPreimage: Uint8Array, time: Date);
    hash(): Hash;
    toPOD(): POD.Status.InvoiceSettled;
    static fromPOD(obj: any): InvoiceSettled | Error;
}
