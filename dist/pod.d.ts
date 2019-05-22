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
export interface ClaimRequest {
    authorization: Signature;
    claim: Hash;
    coins: {
        blindingNonce: PublicKey;
        blindedOwner: PublicKey;
        magnitude: Magnitude;
    }[];
}
export interface ClaimChangeRequest {
    authorization: string;
    claim: Change;
    coins: {
        blindingNonce: PublicKey;
        blindedOwner: PublicKey;
        magnitude: Magnitude;
    }[];
}
export interface ClaimHookinRequest {
    authorization: Signature;
    claim: Hookin;
    coins: {
        blindingNonce: PublicKey;
        blindedOwner: PublicKey;
        magnitude: Magnitude;
    }[];
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
export interface Change {
    claimant: PublicKey;
    amount: number;
    nonce: string;
}
export interface Hookout {
    amount: number;
    bitcoinAddress: string;
    nonce: string;
}
export interface Hookin {
    txid: string;
    vout: number;
    amount: number;
    claimant: string;
}
export interface BitcoinTransfer {
    inputs: Coin[];
    output: Hookout;
    change: Change;
    authorization: string;
}
export interface Transfer {
    inputs: Coin[];
    outputHash: string;
    change: Change;
    authorization: string;
}
export interface TransferHash {
    transferHash: string;
}
