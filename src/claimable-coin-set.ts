import ClaimableCoin from './claimable-coin';

import Hash from './hash';

import PublicKey from './public-key';
import * as assert from './util/assert';
import * as buffutils from './util/buffutils';
import { amountToMagnitudes } from './util/coins';
import * as POD from './pod';

export default class ClaimableCoinSet {
  public static fromPOD(data: any): ClaimableCoinSet | Error {
    if (!Array.isArray(data)) {
      return new Error('ClaimableCoinSet was expecting an array of ClaimableCoins');
    }

    const coins: ClaimableCoin[] = [];

    for (const d of data) {
      const coin = ClaimableCoin.fromPOD(d);
      if (coin instanceof Error) {
        return coin;
      }
      coins.push(coin);
    }
    if (coins.length > 255) {
      return new Error('255 is the max coins in a set');
    }

    return new ClaimableCoinSet(coins);
  }

  public static fromPayTo(creditTo: PublicKey, amount: number) {
    const coins = amountToMagnitudes(amount);

    const claimableOutputs = [];

    for (let i = 0; i < coins.length; i++) {
      const claimant = creditTo.derive(buffutils.fromUint8(i));

      claimableOutputs.push(new ClaimableCoin(claimant, coins[i]));
    }

    return new ClaimableCoinSet(claimableOutputs);
  }

  readonly coins: ClaimableCoin[];

  constructor(outputs: ClaimableCoin[]) {
    this.coins = outputs;
    this.canonicalize();
  }

  public get amount(): number {
    let sum = 0;
    for (const coin of this.coins) {
      sum += 2 ** coin.magnitude;
    }
    return sum;
  }

  public get length() {
    return this.coins.length;
  }

  public [Symbol.iterator]() {
    return this.coins[Symbol.iterator]();
  }

  // modifies the coins.
  private canonicalize() {
    this.coins.sort(compare);
    assert.equal(this.isCanonicalized(), true);
  }

  // just for internal asserts
  private isCanonicalized() {
    for (let i = 1; i < this.coins.length; i++) {
      if (compare(this.coins[i - 1], this.coins[i]) > 0) {
        return false;
      }
    }

    return true;
  }

  public toPOD(): POD.ClaimableCoin[] {
    assert.equal(this.isCanonicalized(), true);

    return this.coins.map(i => i.toPOD());
  }

  public hash() {
    assert.equal(this.isCanonicalized(), true);

    const h = Hash.newBuilder('ClaimableCoinSet');

    for (const coin of this.coins) {
      h.update(coin.hash().buffer);
    }

    return h.digest();
  }
}

function compare(a: ClaimableCoin, b: ClaimableCoin): number {
  const r = a.magnitude - b.magnitude;
  if (r !== 0) {
    return r;
  }

  return buffutils.compare(a.claimant.buffer, b.claimant.buffer);
}
