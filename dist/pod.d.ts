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
    fundingKey: PublicKey | PublicKey[];
    blindCoinKeys: PublicKey[];
    wipeDate?: string;
}
export declare type CoinRequest = {
    blindingNonce: PublicKey;
    blindedOwner: PublicKey;
    magnitude: Magnitude;
};
export interface ClaimRequest {
    hash: string;
    authorization: Signature;
    claimableHash: Hash;
    coinRequests: CoinRequest[];
    fee: number;
}
export interface Coin {
    hash: string;
    receipt: Signature;
    magnitude: Magnitude;
    owner: string;
}
export declare type CoinSet = Coin[];
export interface Hookin {
    hash: string;
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
    bitcoinAddress: string;
    initCreated?: number;
}
export interface AbstractTransfer {
    hash: string;
    amount: Amount;
    authorization: string | null;
    claimant: PublicKey;
    fee: Amount;
    inputs: Coin[];
    initCreated?: number;
}
export interface LightningPayment extends AbstractTransfer {
    paymentRequest: string;
}
export interface FeeBump extends AbstractTransfer {
    txid: string;
    confTarget: number;
}
export interface Hookout extends AbstractTransfer {
    bitcoinAddress: string;
    priority: 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
    fee: Amount;
    rbf: boolean;
}
export interface LightningInvoice {
    hash: string;
    claimant: PublicKey;
    paymentRequest: string;
    initCreated?: number;
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
        hash: string;
        claimableHash: string;
    }
    interface Claimed extends AbstractStatus {
        claimRequest: ClaimRequest;
        blindedReceipts: Signature[];
    }
    interface HookinAccepted extends AbstractStatus {
        consolidationFee: number;
    }
    interface BitcoinTransactionSent extends AbstractStatus {
        txid: string;
    }
    interface Failed extends AbstractStatus {
        reason: string;
        rebate: Amount;
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
    kind: 'HookinAccepted';
} & Status.HookinAccepted) | ({
    kind: 'Failed';
} & Status.Failed) | ({
    kind: 'InvoiceSettled';
} & Status.InvoiceSettled) | ({
    kind: 'LightningPaymentSent';
} & Status.LightningPaymentSent);
