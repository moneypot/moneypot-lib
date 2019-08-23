export declare type Amount = number;
export declare type Signature = string;
export declare type PublicKey = string;
export declare type Hash = string;
export declare function isAmount(x: any): x is Amount;
export declare type Magnitude = number;
export declare const MaxMagnitude = 30;
export interface Acknowledged {
    acknowledgement: Signature;
}
export interface CustodianInfo {
    acknowledgementKey: PublicKey;
    currency: string;
    fundingKey: PublicKey;
    blindCoinKeys: PublicKey[];
}
export declare type CoinRequest = {
    blindingNonce: PublicKey;
    blindedOwner: PublicKey;
    magnitude: Magnitude;
};
export interface ClaimRequest {
    authorization: Signature;
    claimableHash: Hash;
    coinRequests: CoinRequest[];
}
export interface Coin {
    receipt: Signature;
    magnitude: Magnitude;
    owner: string;
}
export declare type CoinSet = Coin[];
export interface Hookin {
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
}
export interface AbstractTransfer {
    amount: Amount;
    authorization: string | null;
    claimant: PublicKey;
    fee: Amount;
    inputs: Coin[];
}
export interface LightningPayment extends AbstractTransfer {
    paymentRequest: string;
}
export interface FeeBump extends AbstractTransfer {
    txid: string;
}
export interface Hookout extends AbstractTransfer {
    bitcoinAddress: string;
    priority: 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
    fee: Amount;
}
export interface TransferHash {
    transferHash: string;
}
export interface LightningInvoice {
    claimant: PublicKey;
    paymentRequest: string;
}
export declare type Claimable = ({
    kind: 'Hookout';
} & Hookout) | ({
    kind: 'Hookin';
} & Hookin) | ({
    kind: 'FeeBump';
} & FeeBump) | ({
    kind: 'LightningPayment';
} & LightningPayment) | ({
    kind: 'LightningInvoice';
} & LightningInvoice);
export declare namespace Status {
    interface AbstractStatus {
        claimableHash: string;
    }
    interface Claimed extends ClaimRequest, AbstractStatus {
        blindedReceipts: Signature[];
    }
    interface BitcoinTransactionSent extends AbstractStatus {
        txid: string;
    }
    interface Failed extends AbstractStatus {
        reason: string;
    }
    interface InvoiceSettled extends AbstractStatus {
        amount: Amount;
        rPreimage: string;
        time: string;
    }
    interface LightningPaymentSent extends AbstractStatus {
        paymentPreimage: string;
        totalFees: Amount;
    }
}
export declare type Status = ({
    kind: 'BitcoinTransactionSent';
} & Status.BitcoinTransactionSent) | ({
    kind: 'Claimed';
} & Status.Claimed) | ({
    kind: 'Failed';
} & Status.Failed) | ({
    kind: 'InvoiceSettled';
} & Status.InvoiceSettled) | ({
    kind: 'LightningPaymentSent';
} & Status.LightningPaymentSent);
