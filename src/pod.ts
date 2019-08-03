export type Amount = number;
export type Signature = string;
export type PublicKey = string;
export type Hash = string;

export function isAmount(x: any): x is Amount {
  return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
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

export type CoinRequest = { blindingNonce: PublicKey; blindedOwner: PublicKey; magnitude: Magnitude };

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
export type CoinSet = Coin[];

export interface Hookin {
  txid: string;
  vout: number;
  amount: number;
  claimant: string;
}

export interface AbstractTransfer {
  amount: Amount;
  authorization: string | null; // bech32 pubkey
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

export type Claimable = LightningPayment | FeeBump | Hookout | Hookin | LightningInvoice;
