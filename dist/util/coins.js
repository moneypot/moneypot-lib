"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("./assert"));
const magnitude_1 = __importDefault(require("../magnitude"));
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