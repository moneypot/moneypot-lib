import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod'

export default class Custodian {
  acknowledgementKey: PublicKey
  fundingKey: PublicKey
  blindCoinKeys: PublicKey[] // of 31...

  constructor(acknowledgementKey: PublicKey, fundingKey: PublicKey, blindCoinKeys: PublicKey[], ) {
    this.acknowledgementKey = acknowledgementKey;
    this.fundingKey = fundingKey;

    this.blindCoinKeys = blindCoinKeys;
  }

  hash() {
    return Hash.fromMessage('Custodian',
      this.acknowledgementKey.buffer,
      this.fundingKey.buffer,
      ...this.blindCoinKeys.map(bk => bk.buffer),
    )
  }

  toPOD(): POD.Custodian {
    return {
      acknowledgementKey: this.acknowledgementKey.toPOD(),
      fundingKey: this.fundingKey.toPOD(),
      blindCoinKeys: this.blindCoinKeys.map(bk => bk.toPOD()),
    }
  }

  static fromPOD(d: any): Custodian | Error {
    if (typeof d !== 'object') {
      return new Error('custodian fromPOD expected an object');
    }
    const acknowledgementKey = PublicKey.fromPOD(d.acknowledgementKey);
    if (acknowledgementKey instanceof Error) {
      return acknowledgementKey;
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


    return new Custodian(acknowledgementKey, fundingKey, blindCoinKeys);

  }


}