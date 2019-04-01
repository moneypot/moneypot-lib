import Coin from './coin';
import * as assert from './util/assert';

import Hash from './hash';

import * as POD from './pod';
import * as buffutils from './util/buffutils';
import { muSig } from './util/ecc';
import PublicKey from './public-key';

export default class CoinSet {
  public static fromPOD(data: any): CoinSet | Error {
    if (!Array.isArray(data)) {
      return new Error('CoinSet was expecting an array');
    }

    const inputs: Coin[] = [];

    for (const input of data) {
      const cc = Coin.fromPOD(input);
      if (cc instanceof Error) {
        return cc;
      }
      inputs.push(cc);
    }

    return new CoinSet(inputs);
  }

  public readonly coins: Coin[];

  constructor(inputs: Coin[]) {
    this.coins = inputs;
  }

  public [Symbol.iterator]() {
    return this.coins[Symbol.iterator]();
  }

  public get amount() {
    let sum = 0;
    for (const coin of this.coins) {
      sum += coin.magnitude.toAmount();
    }
    return sum;
  }

  public get(n: number): Coin {
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

  public toPOD(): POD.CoinSet {
    assert.equal(this.isCanonicalized(), true);

    return this.coins.map(i => i.toPOD());
  }

  public hash() {
    this.canonicalize();

    const h = Hash.newBuilder('CoinSet');

    for (const input of this.coins) {
      h.update(input.hash().buffer);
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

  public isValid() {
    for (const coin of this.coins) {
      if (!coin.isValid()) {
        return false;
      }
    }
    return true;
  }

  public getCombinedPubkey(): PublicKey {
    const p = muSig.pubkeyCombine(this.coins.map(coin => coin.owner));
    return new PublicKey(p.x, p.y);
  }
}

function compare(a: Coin, b: Coin): number {
  const r = a.magnitude.n - b.magnitude.n;
  if (r !== 0) {
    return r;
  }

  return buffutils.compare(a.owner.buffer, b.owner.buffer);
}
