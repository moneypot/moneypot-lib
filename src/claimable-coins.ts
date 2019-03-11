
import Hash from './hash';

import PublicKey from './public-key';
import * as buffutils from './util/buffutils';
import * as POD from './pod';

export default class ClaimableCoins {

  public static fromPOD(data: any): ClaimableCoins | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimableCoins was expected to be an object');
    }
    const amount = data.amount;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return new Error('ClaimableCoins should be a positive integer');
    }

    const claimant = PublicKey.fromBech(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    return new ClaimableCoins(amount, claimant);
  }

  amount: number;
  claimant: PublicKey;

  constructor(amount: number, claimant: PublicKey) {
    this.amount = amount;
    this.claimant = claimant;
  }

  public toPOD(): POD.ClaimableCoins {
    return {
      amount: this.amount,
      claimant: this.claimant.toBech()
    }
  }

  public hash() {

    const h = Hash.newBuilder('ClaimableCoins');
    h.update(buffutils.fromUint64(this.amount));
    h.update(this.claimant.buffer);

    return h.digest();
  }
}
