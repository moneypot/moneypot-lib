import Hash from './hash';
import PublicKey from './public-key';

import * as Buffutils from './util/buffutils';
import * as POD from './pod';
import * as assert from './util/assert';


export default class Change {
  public static fromPOD(data: any): Change | Error {
    if (typeof data !== 'object') {
      return new Error('Change was expected to be an object');
    }
    const amount = data.amount;
    if (!POD.isAmount(amount)) {
      return new Error('Change should be a positive integer');
    }

    const claimant = PublicKey.fromPOD(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new Change(amount, claimant, nonce);
  }

  amount: number;
  claimant: PublicKey;
  nonce: Uint8Array;

  constructor(amount: number, claimant: PublicKey, nonce: Uint8Array) {
    this.amount = amount;
    this.claimant = claimant;

    assert.equal(nonce.length, 32);
    this.nonce = nonce;
  }

  public toPOD(): POD.Change {
    return {
      amount: this.amount,
      claimant: this.claimant.toPOD(),
      nonce: Buffutils.toHex(this.nonce),
    };
  }

  public get buffer() {
    return Buffutils.concat(
      Buffutils.fromUint64(this.amount),
      this.claimant.buffer,
      this.nonce,
    );
  }

  public hash() {
    return Hash.fromMessage('Change', this.buffer);
  }
}
