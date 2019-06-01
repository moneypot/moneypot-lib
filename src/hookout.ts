import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import * as assert from './util/assert';

export type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';


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

    const priority = data.priority;
    if (['CUSTOM', 'IMMEDIATE', 'BATCH', 'FREE'].indexOf(priority) === -1) {
      return new Error('Unrecognized priority');
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new Hookout(amount, bitcoinAddress, priority, nonce);
  }

  public amount: POD.Amount;
  public bitcoinAddress: string;
  public priority: Priority;
  public nonce: Uint8Array;

  constructor(amount: POD.Amount, bitcoinAddress: string, priority: Priority, nonce: Uint8Array) {
    this.amount = amount;
    this.bitcoinAddress = bitcoinAddress;
    this.priority = priority;

    assert.equal(nonce.length, 32);
    this.nonce = nonce;
  }

  public toPOD(): POD.Hookout {
    return {
      amount: this.amount,
      bitcoinAddress: this.bitcoinAddress,
      priority: this.priority,
      nonce: Buffutils.toHex(this.nonce),
    };
  }

  public hash() {
    const h = Hash.newBuilder('Hookout');

    h.update(Buffutils.fromUint64(this.amount));
    h.update(Buffutils.fromString(this.bitcoinAddress));
    h.update(Buffutils.fromUint8(this.priority.charCodeAt(0)));
    h.update(this.nonce);

    return h.digest();
  }
}
