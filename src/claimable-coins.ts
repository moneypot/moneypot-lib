
import Hash from './hash';

import PublicKey from './public-key';
import * as assert from './util/assert';
import * as Buffutils from './util/buffutils';
import * as POD from './pod';

export default class ClaimableCoins {

  public static fromPOD(data: any): ClaimableCoins | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimableCoins was expected to be an object');
    }
    const amount = data.amount;
    if (!POD.isAmount(amount)) {
      return new Error('ClaimableCoins should be a positive integer');
    }

    const claimant = PublicKey.fromBech(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    const nonce = Buffutils.fromHex(data.nonce, 32);
    if (nonce instanceof Error) {
      return nonce;
    }

    return new ClaimableCoins(amount, claimant, nonce);
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

  public toPOD(): POD.ClaimableCoins {
    return {
      amount: this.amount,
      claimant: this.claimant.toBech(),
      nonce: Buffutils.toHex(this.nonce)
    }
  }

  public hash() {
    const h = Hash.newBuilder('ClaimableCoins');
    h.update(Buffutils.fromUint64(this.amount));
    h.update(this.claimant.buffer);
    h.update(this.nonce);
    return h.digest();
  }
}
