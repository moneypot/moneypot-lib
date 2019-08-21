import AbstractStatus from './abstract-status';
import Hash from '../hash';
import { POD } from '..';
export default class InvoiceSettled extends AbstractStatus {
    amount: number;
    rPreimage: Uint8Array;
    time: Date;
    constructor(claimableHash: Uint8Array, amount: number, rPreimage: Uint8Array, time: Date);
    hash(): Hash;
    toPOD(): POD.Status.InvoiceSettled;
    static fromPOD(obj: any): InvoiceSettled | Error;
}
