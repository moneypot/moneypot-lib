import ClaimableCoin from './claimable-coin';
import Hash from './hash';
import * as assert from './util/assert';
import * as buffutils from './util/buffutils';
import { amountToMagnitudes } from './util/coins';
export default class ClaimableCoinSet {
    static fromPOD(data) {
        if (!Array.isArray(data)) {
            return new Error('ClaimableCoinSet was expecting an array of ClaimableCoins');
        }
        const coins = [];
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
    static fromPayTo(creditTo, amount) {
        const coins = amountToMagnitudes(amount);
        const claimableOutputs = [];
        for (let i = 0; i < coins.length; i++) {
            const claimant = creditTo.derive(buffutils.fromUint8(i));
            claimableOutputs.push(new ClaimableCoin(claimant, coins[i]));
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
        const h = Hash.newBuilder('ClaimableCoinSet');
        for (const coin of this.coins) {
            h.update(coin.hash().buffer);
        }
        return h.digest();
    }
}
function compare(a, b) {
    const r = a.magnitude - b.magnitude;
    if (r !== 0) {
        return r;
    }
    return buffutils.compare(a.claimant.buffer, b.claimant.buffer);
}
//# sourceMappingURL=claimable-coin-set.js.map