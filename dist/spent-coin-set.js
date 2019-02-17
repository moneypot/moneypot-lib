"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimed_coin_set_1 = require("./claimed-coin-set");
const signature_1 = require("./signature");
class SpentCoinSet {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('expected object for a spentCoinSet');
        }
        const coins = claimed_coin_set_1.default.fromPOD(data.coins);
        if (coins instanceof Error) {
            return coins;
        }
        if (!Array.isArray(data.spendAuthorization)) {
            return new Error('SpentCoinSet should have an spendAuthorization array of signatures');
        }
        const authorization = [];
        for (const sig of data.spendAuthorization) {
            if (typeof sig !== 'string') {
                return new Error('An spendAuthorization signature is not a string');
            }
            const s = signature_1.default.fromBech(sig);
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
    constructor(coins, authorization) {
        this.coins = coins;
        this.spendAuthorization = authorization;
    }
    isAuthorizedFor(message) {
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins.get(i);
            const sig = this.spendAuthorization[i];
            if (!sig.verify(message, coin.owner)) {
                return false;
            }
        }
        return true;
    }
    [Symbol.iterator]() {
        return this.coins[Symbol.iterator]();
    }
    get amount() {
        return this.coins.amount;
    }
    get(n) {
        return this.coins.get(n);
    }
    get length() {
        return this.coins.length;
    }
    toPOD() {
        return {
            coins: this.coins.toPOD(),
            spendAuthorization: this.spendAuthorization.map(s => s.toBech()),
        };
    }
    hash() {
        return this.coins.hash();
    }
}
exports.default = SpentCoinSet;
//# sourceMappingURL=spent-coin-set.js.map