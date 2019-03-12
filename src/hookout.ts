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

    const immediate = data.immediate;
    if (typeof immediate !== 'boolean') {
      return new Error('Hookout.fromPOD invalid immediate');
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new Hookout(amount, bitcoinAddress, immediate, nonce);
  }

  public amount: POD.Amount;
  public bitcoinAddress: string;
  public immediate: boolean;
  public nonce: Uint8Array;

  constructor(amount: POD.Amount, bitcoinAddress: string, immediate: boolean, nonce: Uint8Array) {
    this.amount = amount;
    this.bitcoinAddress = bitcoinAddress;
    this.immediate = immediate;

    assert.equal(nonce.length, 32);
    this.nonce = nonce;
  }

  public toPOD(): POD.Hookout {
    return {
      amount: this.amount,
      bitcoinAddress: this.bitcoinAddress,
      immediate: this.immediate,
      nonce: Buffutils.toHex(this.nonce),
    };
  }

  public hash() {
    const h = Hash.newBuilder('Hookout');

    h.update(Buffutils.fromUint64(this.amount));
    h.update(Buffutils.fromString(this.bitcoinAddress));
    h.update(Buffutils.fromUint8(this.immediate ? 1 : 0));
    h.update(this.nonce);

    return h.digest();
  }
}
