import Hash from './hash';

import PublicKey from './public-key';
import * as assert from './util/assert';
import * as Buffutils from './util/buffutils';
import * as POD from './pod';

export default class Bounty {
  public static fromPOD(data: any): Bounty | Error {
    if (typeof data !== 'object') {
      return new Error('Bounty was expected to be an object');
    }
    const amount = data.amount;
    if (!POD.isAmount(amount)) {
      return new Error('Bounty should be a positive integer');
    }

    const claimant = PublicKey.fromPOD(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new Bounty(amount, claimant, nonce);
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

  public toPOD(): POD.Bounty {
    return {
      amount: this.amount,
      claimant: this.claimant.toPOD(),
      nonce: Buffutils.toHex(this.nonce),
    };
  }

  public hash() {
    const h = Hash.newBuilder('Bounty');
    h.update(Buffutils.fromUint64(this.amount));
    h.update(this.claimant.buffer);
    h.update(this.nonce);
    return h.digest();
  }
}
