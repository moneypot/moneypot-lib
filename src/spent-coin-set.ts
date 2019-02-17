import ClaimedCoin from './claimed-coin';
import ClaimedCoinSet from './claimed-coin-set';
import Hash from './hash';
import PrivateKey from './private-key';
import Signature from './signature';

import * as POD from './pod';

export default class SpentCoinSet {
  public static fromPOD(data: any): SpentCoinSet | Error {
    if (typeof data !== 'object') {
      return new Error('expected object for a spentCoinSet');
    }

    const coins = ClaimedCoinSet.fromPOD(data.coins);
    if (coins instanceof Error) {
      return coins;
    }

    if (!Array.isArray(data.spendAuthorization)) {
      return new Error('SpentCoinSet should have an spendAuthorization array of signatures');
    }

    const authorization: Signature[] = [];

    for (const sig of data.spendAuthorization) {
      if (typeof sig !== 'string') {
        return new Error('An spendAuthorization signature is not a string');
      }
      const s = Signature.fromBech(sig);
      if (s instanceof Error) {
        return s;
      }

      authorization.push(s);
    }

    if (coins.length !== authorization.length) {
      return new Error('spentcoinset has a mismatched auth/coin length');
    }

    return new SpentCoinSet(coins, authorization);
  }

  public readonly coins: ClaimedCoinSet;
  public readonly spendAuthorization: Signature[];

  constructor(coins: ClaimedCoinSet, authorization: Signature[]) {
    this.coins = coins;
    this.spendAuthorization = authorization;
  }

  public isAuthorizedFor(message: Uint8Array) {
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins.get(i);
      const sig = this.spendAuthorization[i];

      if (!sig.verify(message, coin.owner)) {
        return false;
      }
    }

    return true;
  }

  public [Symbol.iterator]() {
    return this.coins[Symbol.iterator]();
  }

  public get amount() {
    return this.coins.amount;
  }

  public get(n: number): ClaimedCoin {
    return this.coins.get(n);
  }

  public get length() {
    return this.coins.length;
  }

  public toPOD(): POD.SpentCoinSet {
    return {
      coins: this.coins.toPOD(),
      spendAuthorization: this.spendAuthorization.map(s => s.toBech()),
    };
  }

  public hash() {
    return this.coins.hash();
  }
}
