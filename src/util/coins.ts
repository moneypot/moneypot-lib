import * as assert from './assert';
import * as POD from '../pod';

export function amountToMagnitudes(amount: number): POD.Magnitude[] {
  assert.check(Number.isInteger, amount);
  assert.check(x => x >= 0, amount);

  const maxCoinAmount = 2 ** POD.MaxMagnitude;
  let maxCoins = 0; // how many maxCoins we need

  if (amount > maxCoinAmount) {
    const biggerBy = amount - maxCoinAmount;
    maxCoins = Math.floor(biggerBy / maxCoinAmount);
    amount -= maxCoins * maxCoinAmount;
  }

  const coins = [];

  for (let shift = 0; amount > 0; shift++) {
    if (amount % 2 === 1) {
      coins.push(shift);
    }
    amount >>= 1; // This works because MaxMagnitude is less than 32
  }

  while (maxCoins-- > 0) {
    coins.push(POD.MaxMagnitude);
  }

  return coins;
}
