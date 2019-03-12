export type Amount = number;

export function isAmount(x: any): x is Amount {
  return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
}

export type Magnitude = number;

export const MaxMagnitude = 30;

export function isMagnitude(x: any): x is Magnitude {
  return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0 && x <= MaxMagnitude;
}

export interface Acknowledged {
  acknowledgement: string;
}

export interface ClaimRequest {
  authorization: string;
  claim: ClaimableCoins;
  coins: { blindingNonce: string, blindedOwner: string, magnitude: Magnitude }[]
}

export interface ClaimResponse {
  claimRequest: ClaimRequest;
  blindedExistenceProofs: string[];
}

export interface ClaimedCoin {
  existenceProof: string;
  magnitude: Magnitude;
  owner: string;
}

export interface ClaimableCoins {
  claimant: string;
  amount: number;
  nonce: string;
}

export type ClaimedCoinSet = ClaimedCoin[];

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


export interface Transfer {
  input: string; // hash
  output: string; // hash
  authorization: string;
}

export interface TransferCoinToCoin {
  input: ClaimedCoinSet;
  output: ClaimableCoins;
  authorization: string;
}

export interface TransferHookinToCoin {
  input: Hookin;
  output: ClaimableCoins;
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
