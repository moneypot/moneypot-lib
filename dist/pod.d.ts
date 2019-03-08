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
export interface SpentCoinSet {
    coins: ClaimedCoinSet;
    spendAuthorization: string[];
}
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
export interface SpentHookin extends Hookin {
    spendAuthorization: string;
}
export declare type ClaimableCoinSet = ClaimableCoin[];
export interface Transfer {
    input: string;
    output: string;
}
export interface TransferCoinToCoin {
    input: SpentCoinSet;
    output: ClaimableCoinSet;
}
export interface TransferHookinToCoin {
    input: SpentHookin;
    output: ClaimableCoinSet;
}
export interface TransferCoinToHookout {
    input: SpentCoinSet;
    output: Hookout;
}
export interface TransferHash {
    transferHash: string;
}
