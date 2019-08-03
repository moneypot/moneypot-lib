import * as acknowledged from './acknowledged';
export declare type Claimable = acknowledged.Hookout | acknowledged.FeeBump | acknowledged.LightningPayment | acknowledged.LightningInvoice | acknowledged.Hookin;
export declare function podToClaimable(obj: any): Claimable | Error;
export declare function claimableToPod(c: Claimable): {
    acknowledgement: string;
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
    kind: string;
} | {
    acknowledgement: string;
    txid: string;
    amount: number;
    authorization: string | null;
    claimant: string;
    fee: number;
    inputs: import("./pod").Coin[];
    kind: string;
} | {
    acknowledgement: string;
    claimant: string;
    paymentRequest: string;
    kind: string;
} | {
    acknowledgement: string;
    bitcoinAddress: string;
    priority: "CUSTOM" | "IMMEDIATE" | "BATCH" | "FREE";
    fee: number;
    amount: number;
    authorization: string | null;
    claimant: string;
    inputs: import("./pod").Coin[];
    kind: string;
};
