import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import * as assert from './util/assert';

export default class FeeBump {
  public static fromPOD(data: any): FeeBump | Error {
    if (typeof data !== 'object') {
      return new Error('FeeBump.fromPOD is not object');
    }

    const txid = Buffutils.fromHex(data.txid, 32);
    if (typeof txid !== 'string') {
      return new Error('FeeBump.fromPOD invalid txid');
    }

    const amount = data.amount;
    if (!POD.isAmount(amount)) {
      return new Error('FeeBump.fromPOD needs an amount');
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new FeeBump(txid, nonce, amount);
  }

  public txid: Uint8Array;
  public nonce: Uint8Array;
  public amount: POD.Amount;

  constructor(txid: Uint8Array, nonce: Uint8Array, amount: POD.Amount) {
    assert.equal(txid.length, 32);
    this.txid = txid;

    assert.equal(nonce.length, 32);
    this.nonce = nonce;

    this.amount = amount;
  }

  public toPOD(): POD.FeeBump {
    return {
      txid: Buffutils.toHex(this.txid),
      nonce: Buffutils.toHex(this.nonce),
      amount: this.amount,
    };
  }

  public hash() {
    const h = Hash.newBuilder('FeeBump');

    h.update(this.txid);
    h.update(this.nonce);
    h.update(Buffutils.fromUint64(this.amount));

    return h.digest();
  }
}
