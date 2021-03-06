"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./assert");
const magnitude_1 = require("../magnitude");
function amountToMagnitudes(amount) {
    assert.check(Number.isInteger, amount);
    assert.check(x => x >= 0, amount);
    const maxCoinAmount = 2 ** magnitude_1.default.MaxMagnitude;
    let maxCoins = 0; // how many maxCoins we need
    if (amount > maxCoinAmount) {
        const biggerBy = amount - maxCoinAmount;
        maxCoins = Math.floor(biggerBy / maxCoinAmount);
        amount -= maxCoins * maxCoinAmount;
    }
    const coins = [];
    for (let shift = 0; amount > 0; shift++) {
        if (amount % 2 === 1) {
            coins.push(new magnitude_1.default(shift));
        }
        amount >>= 1; // This works because MaxMagnitude is less than 32
    }
    while (maxCoins-- > 0) {
        coins.push(new magnitude_1.default(magnitude_1.default.MaxMagnitude));
    }
    return coins;
}
exports.amountToMagnitudes = amountToMagnitudes;
//# sourceMappingURL=coins.js.map