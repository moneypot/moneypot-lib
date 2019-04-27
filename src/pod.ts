export type Amount = number;

export function isAmount(x: any): x is Amount {
  return typeof x === 'number' && Number.isSafeInteger(x) && x > 0;
}

export type Magnitude = number;

export const MaxMagnitude = 30;

export interface Acknowledged {
  acknowledgement: string;
}

export interface CustodianInfo {
  acknowledgementKey: string; // pubkey
  currency: string;
  fundingKey: string; // pubkey
  blindCoinKeys: string[]; // pubkeys
}

export interface ClaimRequest {
  authorization: string;
  claim: string; // hash
  coins: { blindingNonce: string; blindedOwner: string; magnitude: Magnitude }[];
}

export interface ClaimBountyRequest {
  authorization: string;
  claim: Bounty;
  coins: { blindingNonce: string; blindedOwner: string; magnitude: Magnitude }[];
}

export interface ClaimHookinRequest {
  authorization: string;
  claim: Hookin;
  coins: { blindingNonce: string; blindedOwner: string; magnitude: Magnitude }[];
}

export interface ClaimResponse {
  claimRequest: ClaimRequest;
  blindedReceipts: string[];
}

export interface Coin {
  receipt: string;
  magnitude: Magnitude;
  owner: string;
}
export type CoinSet = Coin[];

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
}

export interface KindedHookout extends Hookout {
  kind: 'Hookout';
}

export interface KindedBounty extends Bounty {
  kind: 'Bounty';
}

export interface FullTransfer {
  inputs: Coin[];
  output: KindedHookout | KindedBounty;
  change: Bounty;
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
