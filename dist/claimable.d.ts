import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';
export declare type Claimable = Hookout | FeeBump | LightningPayment | LightningInvoice | Hookin;
export declare function podToClaimable(obj: any): Claimable | Error;
export declare function claimableToPod(c: Claimable): {
    bitcoinAddress: string;
    priority: "CUSTOM" | "IMMEDIATE" | "BATCH" | "FREE";
    fee: number;
    amount: number;
    authorization: string | null;
    claimant: string;
    inputs: import("./pod").Coin[];
    kind: string;
} | {
    txid: string;
    amount: number;
    authorization: string | null;
    claimant: string;
    fee: number;
    inputs: import("./pod").Coin[];
    kind: string;
} | {
    paymentRequest: string;
    amount: number;
    authorization: string | null;
    claimant: string;
    fee: number;
    inputs: import("./pod").Coin[];
    kind: string;
} | {
    claimant: string;
    paymentRequest: string;
    kind: string;
} | {
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
    kind: string;
};
