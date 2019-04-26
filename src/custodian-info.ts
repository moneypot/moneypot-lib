import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';

export default class CustodianInfo {
  acknowledgementKey: PublicKey;
  currency: string;
  fundingKey: PublicKey;
  blindCoinKeys: PublicKey[]; // of 31...

  constructor(acknowledgementKey: PublicKey, currency: string, fundingKey: PublicKey, blindCoinKeys: PublicKey[]) {
    this.acknowledgementKey = acknowledgementKey;
    this.currency = currency;
    this.fundingKey = fundingKey;
    this.blindCoinKeys = blindCoinKeys;
  }

  hash() {
    return Hash.fromMessage(
      'Custodian',
      this.acknowledgementKey.buffer,
      Buffutils.fromUint32(this.currency.length),
      Buffutils.fromString(this.currency),
      this.fundingKey.buffer,
      ...this.blindCoinKeys.map(bk => bk.buffer)
    );
  }

  toPOD(): POD.Custodian {
    return {
      acknowledgementKey: this.acknowledgementKey.toPOD(),
      currency: this.currency,
      fundingKey: this.fundingKey.toPOD(),
      blindCoinKeys: this.blindCoinKeys.map(bk => bk.toPOD()),
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

    if (Array.isArray(d.blindCoinKeys) || d.blindCoinKeys.length !== 31) {
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

    return new CustodianInfo(acknowledgementKey, currency, fundingKey, blindCoinKeys);
  }
}
