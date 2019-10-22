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
  hash: string;
  authorization: Signature;
  claimableHash: Hash;
  coinRequests: CoinRequest[];
}

export interface Coin {
  hash: string;
  receipt: Signature;
  magnitude: Magnitude;
  owner: string;
}
export type CoinSet = Coin[];

export interface Hookin {
  hash: string;
  txid: string;
  vout: number;
  amount: number;
  claimant: string;
  bitcoinAddress: string;
}

export interface AbstractTransfer {
  hash: string;
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

export interface LightningInvoice {
  hash: string;
  claimant: PublicKey;
  paymentRequest: string;
}

export type Claimable =
  | ({ kind: 'Hookout' } & Hookout)
  | ({ kind: 'Hookin' } & Hookin)
  | ({ kind: 'FeeBump' } & FeeBump)
  | ({ kind: 'LightningPayment' } & LightningPayment)
  | ({ kind: 'LightningInvoice' } & LightningInvoice);

export namespace Status {
  export interface AbstractStatus {
    hash: string;
    claimableHash: string;
  }

  export interface Claimed extends AbstractStatus {
    claimRequest: ClaimRequest;
    blindedReceipts: Signature[];
  }

  export interface HookinAccepted extends AbstractStatus {
    consolidationFee: number;
  }

  export interface BitcoinTransactionSent extends AbstractStatus {
    txid: string;
  }

  export interface Failed extends AbstractStatus {
    reason: string;
    rebate: Amount;
  }

  export interface InvoiceSettled extends AbstractStatus {
    amount: Amount;
    rPreimage: string;
    time: string;
  }

  export interface LightningPaymentSent extends AbstractStatus {
    paymentPreimage: string;
    totalFees: Amount;
  }
}

export type Status =
  | ({ kind: 'BitcoinTransactionSent' } & Status.BitcoinTransactionSent)
  | ({ kind: 'Claimed' } & Status.Claimed)
  | ({ kind: 'HookinAccepted' } & Status.HookinAccepted)
  | ({ kind: 'Failed' } & Status.Failed)
  | ({ kind: 'InvoiceSettled' } & Status.InvoiceSettled)
  | ({ kind: 'LightningPaymentSent' } & Status.LightningPaymentSent);
