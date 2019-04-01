"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coin_1 = require("./coin");
const assert = require("./util/assert");
const hash_1 = require("./hash");
const buffutils = require("./util/buffutils");
const ecc_1 = require("./util/ecc");
const public_key_1 = require("./public-key");
class CoinSet {
    static fromPOD(data) {
        if (!Array.isArray(data)) {
            return new Error('CoinSet was expecting an array');
        }
        const inputs = [];
        for (const input of data) {
            const cc = coin_1.default.fromPOD(input);
            if (cc instanceof Error) {
                return cc;
            }
            inputs.push(cc);
        }
        return new CoinSet(inputs);
    }
    constructor(inputs) {
        this.coins = inputs;
    }
    [Symbol.iterator]() {
        return this.coins[Symbol.iterator]();
    }
    get amount() {
        let sum = 0;
        for (const coin of this.coins) {
            sum += coin.magnitude.toAmount();
        }
        return sum;
    }
    get(n) {
        assert.equal(n >= 0, true);
        assert.equal(n < this.length, true);
        return this.coins[n];
    }
    // modifies the coins.
    canonicalize() {
        this.coins.sort(compare);
    }
    get length() {
        return this.coins.length;
    }
    toPOD() {
        assert.equal(this.isCanonicalized(), true);
        return this.coins.map(i => i.toPOD());
    }
    hash() {
        this.canonicalize();
        const h = hash_1.default.newBuilder('CoinSet');
        for (const input of this.coins) {
            h.update(input.hash().buffer);
        }
        return h.digest();
    }
    isCanonicalized() {
        for (let i = 1; i < this.coins.length; i++) {
            if (compare(this.coins[i - 1], this.coins[i]) > 0) {
                return false;
            }
        }
        return true;
    }
    isValid() {
        for (const coin of this.coins) {
            if (!coin.isValid()) {
                return false;
            }
        }
        return true;
    }
    getCombinedPubkey() {
        const p = ecc_1.muSig.pubkeyCombine(this.coins.map(coin => coin.owner));
        return new public_key_1.default(p.x, p.y);
    }
}
exports.default = CoinSet;
function compare(a, b) {
    const r = a.magnitude.n - b.magnitude.n;
    if (r !== 0) {
        return r;
    }
    return buffutils.compare(a.owner.buffer, b.owner.buffer);
}
//# sourceMappingURL=coin-set.js.map