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
    claimHash: Hash;
    coinRequests: CoinRequest[];
}
export interface ClaimResponse {
    claimRequest: ClaimRequest;
    blindedReceipts: Signature[];
}
export interface Coin {
    receipt: Signature;
    magnitude: Magnitude;
    owner: string;
}
export declare type CoinSet = Coin[];
export interface Hookout extends Transfer {
    bitcoinAddress: string;
    priority: 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';
    fee: Amount;
}
export interface FeeBump extends Transfer {
    txid: string;
}
export interface Hookin {
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
}
export interface Transfer {
    amount: Amount;
    authorization: string | null;
    claimant: PublicKey;
    fee: Amount;
    inputs: Coin[];
}
export interface TransferHash {
    transferHash: string;
}
export interface LightningInvoice {
    claimant: PublicKey;
    paymentRequest: string;
}
export interface LightningPayment extends Transfer {
    paymentRequest: string;
}
