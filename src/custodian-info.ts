import PublicKey from './public-key';
import Hash from './hash';
import * as bech32 from './util/bech32';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';
import Signature from './signature'

export default class CustodianInfo {
  acknowledgementKey: PublicKey;
  currency: string;
  fundingKey: PublicKey;
  blindCoinKeys: PublicKey[]; // of 31...
  wipeDate?: string;
  wipeDateSig?: POD.Signature;

  constructor(acknowledgementKey: PublicKey, currency: string, fundingKey: PublicKey, blindCoinKeys: PublicKey[], wipeDate?: string, wipeDateSig?: POD.Signature) {
    this.acknowledgementKey = acknowledgementKey;
    this.currency = currency;
    this.fundingKey = fundingKey;
    this.blindCoinKeys = blindCoinKeys;
    this.wipeDateSig = wipeDateSig;
    this.wipeDate = wipeDate;
  }
// TODO.
  hash() {
    return Hash.fromMessage(
      'Custodian',
      this.acknowledgementKey.buffer,
      Buffutils.fromUint32(this.currency.length),
      Buffutils.fromString(this.currency),
      this.fundingKey.buffer,
      ...this.blindCoinKeys.map(bk => bk.buffer),
      Buffutils.fromString(this.wipeDate ? this.wipeDate : '')
    );
  }

  // 4 letter code for using in an Address
  prefix(): string {
    const hash = this.hash().buffer;
    return (
      bech32.ALPHABET[hash[0] % 32] +
      bech32.ALPHABET[hash[1] % 32] +
      bech32.ALPHABET[hash[2] % 32] +
      bech32.ALPHABET[hash[3] % 32]
    );
  }

  toPOD(): POD.CustodianInfo {
    return {
      acknowledgementKey: this.acknowledgementKey.toPOD(),
      currency: this.currency,
      fundingKey: this.fundingKey.toPOD(),
      blindCoinKeys: this.blindCoinKeys.map(bk => bk.toPOD()),
      wipeDate: this.wipeDate,
      wipeDateSig: this.wipeDateSig
    };
  }

  static fromPOD(d: any): CustodianInfo | Error {
    if (typeof d !== 'object') {
      return new Error('custodian fromPOD expected an object');
    }
    const acknowledgementKey = PublicKey.fromPOD(d.acknowledgementKey);
    if (acknowledgementKey instanceof Error) {
      return acknowledgementKey;
    }

    const currency = d.currency;
    if (typeof currency !== 'string') {
      return new Error('custodian expected a stringified currency');
    }

    const fundingKey = PublicKey.fromPOD(d.fundingKey);
    if (fundingKey instanceof Error) {
      return fundingKey;
    }

    if (!Array.isArray(d.blindCoinKeys) || d.blindCoinKeys.length !== 31) {
      return new Error('custodian expected an 31-length array for blindCoinKeys');
    }
    const blindCoinKeys = [];
    for (const bkstr of d.blindCoinKeys) {
      const bk = PublicKey.fromPOD(bkstr);
      if (bk instanceof Error) {
        return bk;
      }

      blindCoinKeys.push(bk);
    }

    // doesn't force a type..
    const wipeDate = d.wipeDate
    if (wipeDate) {
      if (typeof wipeDate !== 'string') {
        return new Error('Invalid format used for the date.')
      }
    }
    
    const wipeDateSig = d.wipeDateSig

    if (wipeDateSig) { 
      const sig = Signature.fromPOD(wipeDateSig)
      if (sig instanceof Error) { 
        return sig
      }
    }

    return new CustodianInfo(acknowledgementKey, currency, fundingKey, blindCoinKeys, wipeDate, wipeDateSig);
  }
}
