export declare type Amount = number;
export declare function isAmount(x: any): x is Amount;
export declare type Magnitude = number;
export declare const MaxMagnitude = 30;
export interface Acknowledged {
    acknowledgement: string;
}
export interface ClaimRequest {
    authorization: string;
    claim: string;
    coins: {
        blindingNonce: string;
        blindedOwner: string;
        magnitude: Magnitude;
    }[];
}
export interface ClaimBountyRequest {
    authorization: string;
    claim: Bounty;
    coins: {
        blindingNonce: string;
        blindedOwner: string;
        magnitude: Magnitude;
    }[];
}
export interface ClaimHookinRequest {
    authorization: string;
    claim: Hookin;
    coins: {
        blindingNonce: string;
        blindedOwner: string;
        magnitude: Magnitude;
    }[];
}
export interface ClaimResponse {
    claimRequest: ClaimRequest;
    blindedExistenceProofs: string[];
}
export interface Coin {
    existenceProof: string;
    magnitude: Magnitude;
    owner: string;
}
export declare type CoinSet = Coin[];
export interface Bounty {
    claimant: string;
    amount: number;
    nonce: string;
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
    claimant: string;
    deriveIndex: number;
}
export interface Transfer {
    input: CoinSet;
    output: string;
    authorization: string;
}
export interface TransferBounty {
    input: CoinSet;
    output: Bounty;
    authorization: string;
}
export interface TransferHookout {
    input: CoinSet;
    output: Hookout;
    authorization: string;
}
export interface TransferHash {
    transferHash: string;
}
