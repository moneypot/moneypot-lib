import * as POD from '../pod';
import Claimed from './claimed';
import Failed from './failed';
import BitcoinTransactionSent from './bitcoin-transaction-sent';
import InvoiceSettled from './invoice-settled';
import LightningPaymentSent from './lightning-payment-sent';
declare type StatusType = Claimed | Failed | BitcoinTransactionSent | InvoiceSettled | LightningPaymentSent;
export default class Status {
    s: StatusType;
    constructor(s: StatusType);
    static fromPOD(obj: any): Status | Error;
    toPOD(): POD.Status;
    hash(): import("..").Hash;
    claimableHash(): import("..").Hash;
}
export {};
