import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import * as assert from './util/assert';

export default class Hookout {
  public static fromPOD(data: any): Hookout | Error {
    if (typeof data !== 'object') {
      return new Error('Hookout.fromPOD is not object');
    }

    const amount = data.amount;
    if (!POD.isAmount(amount)) {
      return new Error('Hookout.fromPOD invalid amount');
    }

    const bitcoinAddress = data.bitcoinAddress;
    if (typeof bitcoinAddress !== 'string') {
      return new Error('Hookout.fromPOD invalid bitcoin address');
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new Hookout(amount, bitcoinAddress, nonce);
  }

  public amount: POD.Amount;
  public bitcoinAddress: string;
  public nonce: Uint8Array;

  constructor(amount: POD.Amount, bitcoinAddress: string, nonce: Uint8Array) {
    this.amount = amount;
    this.bitcoinAddress = bitcoinAddress;

    assert.equal(nonce.length, 32);
    this.nonce = nonce;
  }

  public toPOD(): POD.Hookout {
    return {
      amount: this.amount,
      bitcoinAddress: this.bitcoinAddress,
      nonce: Buffutils.toHex(this.nonce),
    };
  }

  public hash() {
    const h = Hash.newBuilder('Hookout');

    h.update(Buffutils.fromUint64(this.amount));
    h.update(Buffutils.fromString(this.bitcoinAddress));
    h.update(this.nonce);

    return h.digest();
  }
}
