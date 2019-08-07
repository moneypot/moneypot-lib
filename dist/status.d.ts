import * as POD from './pod';
export interface InvoiceSettled {
    kind: 'InvoiceSettled';
    settlement: {
        amount: number;
        rPreimage: string;
        time: Date;
    };
}
export interface LightningPaymentSucceeded {
    kind: 'LightningPaymentSucceeded';
    result: {
        paymentPreimage: string;
        totalFees: POD.Amount;
    };
}
export interface Claimed {
    kind: 'Claimed';
    claim: POD.Acknowledged & POD.ClaimResponse;
    amount: POD.Amount;
}
export declare type All = {
    kind: 'LightningPaymentFailed';
} | LightningPaymentSucceeded | {
    kind: 'FeebumpFailed';
    error: string;
} | {
    kind: 'FeebumpSucceeded';
    newTxid: string;
} | {
    kind: 'HookoutFailed';
    error: string;
} | {
    kind: 'HookoutSucceeded';
    txid: string;
} | Claimed | InvoiceSettled;
