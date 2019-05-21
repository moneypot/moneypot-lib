export type Amount = number;
export type Signature = string;
export type PublicKey = string;
export type Hash = string;

export function isAmount(x: any): x is Amount {
  return typeof x === 'number' && Number.isSafeInteger(x) && x > 0;
}

export type Magnitude = number;

export const MaxMagnitude = 30;

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
  coins: { blindingNonce: PublicKey; blindedOwner: PublicKey; magnitude: Magnitude }[];
}

export interface ClaimChangeRequest {
  authorization: string;
  claim: Change;
  coins: { blindingNonce: PublicKey; blindedOwner: PublicKey; magnitude: Magnitude }[];
}

export interface ClaimHookinRequest {
  authorization: Signature;
  claim: Hookin;
  coins: { blindingNonce: PublicKey; blindedOwner: PublicKey; magnitude: Magnitude }[];
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
export type CoinSet = Coin[];

export interface Change {
  claimant: PublicKey;
  amount: number;
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
}


export interface BitcoinTransfer {
  inputs: Coin[];
  output: Hookout;
  change: Change;
  authorization: string; // bech32 pubkey
}

export interface Transfer {
  inputs: Coin[];
  outputHash: string;
  changeHash: string;
  authorization: string; // bech32 pubkey
}

export interface TransferHash {
  transferHash: string;
}
