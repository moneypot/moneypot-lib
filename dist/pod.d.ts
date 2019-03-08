export declare type Amount = number;
export declare function isAmount(x: any): x is Amount;
export declare type Magnitude = number;
export declare const MaxMagnitude = 30;
export declare function isMagnitude(x: any): x is Magnitude;
export interface Acknowledged {
    acknowledgement: string;
}
export interface ClaimRequest {
    authorization: string;
    blindingNonce: string;
    blindedOwner: string;
    coin: ClaimableCoin;
}
export interface ClaimResponse {
    blindedExistenceProof: string;
    claimRequest: ClaimRequest;
}
export interface ClaimedCoin {
    existenceProof: string;
    magnitude: Magnitude;
    owner: string;
}
export declare type ClaimedCoinSet = ClaimedCoin[];
export interface ClaimableCoin {
    claimant: string;
    magnitude: Magnitude;
}
export interface Hookout {
    amount: number;
    bitcoinAddress: string;
    immediate: boolean;
    nonce: string;
}
export interface Hookin {
    txid: string;
    vout: number;
    amount: number;
    creditTo: string;
    deriveIndex: number;
}
export declare type ClaimableCoinSet = ClaimableCoin[];
export interface Transfer {
    input: string;
    output: string;
    authorization: string;
}
export interface TransferCoinToCoin {
    input: ClaimedCoinSet;
    output: ClaimableCoinSet;
    authorization: string;
}
export interface TransferHookinToCoin {
    input: Hookin;
    output: ClaimableCoinSet;
    authorization: string;
}
export interface TransferCoinToHookout {
    input: ClaimedCoinSet;
    output: Hookout;
    authorization: string;
}
export interface TransferHash {
    transferHash: string;
}
