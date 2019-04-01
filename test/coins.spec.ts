import * as assert from 'assert';
import 'mocha';
import { amountToMagnitudes } from '../src/util/coins';

describe('coins', () => {
  it('handle some simple cases', () => {
    let coins = amountToMagnitudes(3);

    assert.strictEqual([0, 1].toString(), coins.map(m => m.n).toString());

    coins = amountToMagnitudes(25);
    assert.strictEqual([0, 3, 4].toString(), coins.map(m => m.n).toString());
  });

  it('handle some max-coin cases', () => {
    const amount = 2 ** 33 + Math.floor(Math.random() * 1000);

    const coins = amountToMagnitudes(amount);

    let sum = 0;
    for (const coin of coins) {
      sum += coin.toAmount();
    }

    assert.strictEqual(sum, amount);
  });
});
