import Claimed from './claimed';
import Failed from './failed';
import BitcoinTransactionSent from './bitcoin-transaction-sent';
import InvoiceSettled from './invoice-settled';
import LightningPaymentSent from './lightning-payment-sent';
import HookinAccepted from './hookin-accepted';
export declare type Status = Claimed | Failed | BitcoinTransactionSent | InvoiceSettled | LightningPaymentSent | HookinAccepted;
export declare function statusFromPOD(obj: any): Status | Error;
export declare function statusToPOD(s: Status): {
    txid: string;
    hash: string;
    claimableHash: string;
    kind: "BitcoinTransactionSent";
} | {
    reason: string;
    hash: string;
    claimableHash: string;
    kind: "Failed";
} | {
    amount: number;
    rPreimage: string;
    time: string;
    hash: string;
    claimableHash: string;
    kind: "InvoiceSettled";
} | {
    claimRequest: import("../pod").ClaimRequest;
    blindedReceipts: string[];
    hash: string;
    claimableHash: string;
    kind: "Claimed";
} | {
    paymentPreimage: string;
    totalFees: number;
    hash: string;
    claimableHash: string;
    kind: "LightningPaymentSent";
} | {
    consolidationFee: number;
    hash: string;
    claimableHash: string;
    kind: "HookinAccepted";
};
