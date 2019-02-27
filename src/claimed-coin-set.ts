import ClaimedCoin from './claimed-coin';
import * as assert from './util/assert';

import Hash from './hash';

import * as POD from './pod';
import * as buffutils from './util/buffutils';

export default class ClaimedCoinSet {
  public static fromPOD(data: any): ClaimedCoinSet | Error {
    if (!Array.isArray(data)) {
      return new Error('ClaimedCoinSet was expecting an array');
    }

    const inputs: ClaimedCoin[] = [];

    for (const input of data) {
      const cc = ClaimedCoin.fromPOD(input);
      if (cc instanceof Error) {
        return cc;
      }
      inputs.push(cc);
    }

    return new ClaimedCoinSet(inputs);
  }

  public readonly coins: ClaimedCoin[];

  constructor(inputs: ClaimedCoin[]) {
    this.coins = inputs;
  }

  public [Symbol.iterator]() {
    return this.coins[Symbol.iterator]();
  }

  public get amount() {
    let sum = 0;
    for (const coin of this.coins) {
      sum += 2 ** coin.magnitude;
    }
    return sum;
  }

  public get(n: number): ClaimedCoin {
    assert.equal(n >= 0, true);
    assert.equal(n < this.length, true);

    return this.coins[n];
  }

  // modifies the coins.
  public canonicalize() {
    this.coins.sort(compare);
  }

  public get length() {
    return this.coins.length;
  }

  public toPOD(): POD.ClaimedCoinSet {
    assert.equal(this.isCanonicalized(), true);

    return this.coins.map(i => i.toPOD());
  }

  public async hash() {
    this.canonicalize();

    const h = Hash.newBuilder('ClaimedCoinSet');

    for (const input of this.coins) {
      h.update((await input.hash()).buffer);
    }

    return h.digest();
  }

  private isCanonicalized() {
    for (let i = 1; i < this.coins.length; i++) {
      if (compare(this.coins[i - 1], this.coins[i]) > 0) {
        return false;
      }
    }

    return true;
  }
}

function compare(a: ClaimedCoin, b: ClaimedCoin): number {
  const r = a.magnitude - b.magnitude;
  if (r !== 0) {
    return r;
  }

  return buffutils.compare(a.owner.buffer, b.owner.buffer);
}
