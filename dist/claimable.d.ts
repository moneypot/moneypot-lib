import * as acknowledged from './acknowledged';
export declare type Claimable = acknowledged.Hookout | acknowledged.FeeBump | acknowledged.LightningPayment | acknowledged.LightningInvoice | acknowledged.Hookin;
export declare function podToClaimable(obj: any): Claimable | Error;
export declare function claimableToPod(claimable: Claimable): {
    bitcoinAddress: string;
    priority: "CUSTOM" | "IMMEDIATE" | "BATCH" | "FREE";
    fee: number;
    amount: number;
    authorization: string | null;
    claimant: string;
    inputs: import("./pod").Coin[];
    kind: "Hookout";
} | {
    txid: string;
    amount: number;
    authorization: string | null;
    claimant: string;
    fee: number;
    inputs: import("./pod").Coin[];
    kind: "FeeBump";
} | {
    paymentRequest: string;
    amount: number;
    authorization: string | null;
    claimant: string;
    fee: number;
    inputs: import("./pod").Coin[];
    kind: "LightningPayment";
} | {
    claimant: string;
    paymentRequest: string;
    kind: "LightningInvoice";
} | {
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
    kind: "Hookin";
};
