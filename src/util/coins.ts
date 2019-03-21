import * as assert from './assert';
import Magnitude from '../magnitude';

export function amountToMagnitudes(amount: number): Magnitude[] {
  assert.check(Number.isInteger, amount);
  assert.check(x => x >= 0, amount);

  const maxCoinAmount = 2 ** Magnitude.MaxMagnitude;
  let maxCoins = 0; // how many maxCoins we need

  if (amount > maxCoinAmount) {
    const biggerBy = amount - maxCoinAmount;
    maxCoins = Math.floor(biggerBy / maxCoinAmount);
    amount -= maxCoins * maxCoinAmount;
  }

  const coins: Magnitude[] = [];

  for (let shift = 0; amount > 0; shift++) {
    if (amount % 2 === 1) {
      coins.push(new Magnitude(shift));
    }
    amount >>= 1; // This works because MaxMagnitude is less than 32
  }

  while (maxCoins-- > 0) {
    coins.push(new Magnitude(Magnitude.MaxMagnitude));
  }

  return coins;
}
