"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimable_coin_1 = require("./claimable-coin");
const hash_1 = require("./hash");
const assert = require("./util/assert");
const buffutils = require("./util/buffutils");
const coins_1 = require("./util/coins");
class ClaimableCoinSet {
    static fromPOD(data) {
        if (!Array.isArray(data)) {
            return new Error('ClaimableCoinSet was expecting an array of ClaimableCoins');
        }
        const coins = [];
        for (const d of data) {
            const coin = claimable_coin_1.default.fromPOD(d);
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
    static fromPayTo(creditTo, amount) {
        const coins = coins_1.amountToMagnitudes(amount);
        const claimableOutputs = [];
        for (let i = 0; i < coins.length; i++) {
            const claimant = creditTo.derive(buffutils.fromUint8(i));
            claimableOutputs.push(new claimable_coin_1.default(claimant, coins[i]));
        }
        return new ClaimableCoinSet(claimableOutputs);
    }
    constructor(outputs) {
        this.coins = outputs;
        this.canonicalize();
    }
    get amount() {
        let sum = 0;
        for (const coin of this.coins) {
            sum += 2 ** coin.magnitude;
        }
        return sum;
    }
    get length() {
        return this.coins.length;
    }
    [Symbol.iterator]() {
        return this.coins[Symbol.iterator]();
    }
    // modifies the coins.
    canonicalize() {
        this.coins.sort(compare);
        assert.equal(this.isCanonicalized(), true);
    }
    // just for internal asserts
    isCanonicalized() {
        for (let i = 1; i < this.coins.length; i++) {
            if (compare(this.coins[i - 1], this.coins[i]) > 0) {
                return false;
            }
        }
        return true;
    }
    toPOD() {
        assert.equal(this.isCanonicalized(), true);
        return this.coins.map(i => i.toPOD());
    }
    hash() {
        assert.equal(this.isCanonicalized(), true);
        const h = hash_1.default.newBuilder('ClaimableCoinSet');
        for (const coin of this.coins) {
            h.update(coin.hash().buffer);
        }
        return h.digest();
    }
}
exports.default = ClaimableCoinSet;
function compare(a, b) {
    const r = a.magnitude - b.magnitude;
    if (r !== 0) {
        return r;
    }
    return buffutils.compare(a.claimant.buffer, b.claimant.buffer);
}
//# sourceMappingURL=claimable-coin-set.js.map