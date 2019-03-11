"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const buffutils = require("./util/buffutils");
class ClaimableCoins {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('ClaimableCoins was expected to be an object');
        }
        const amount = data.amount;
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return new Error('ClaimableCoins should be a positive integer');
        }
        const claimant = public_key_1.default.fromBech(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        return new ClaimableCoins(amount, claimant);
    }
    constructor(amount, claimant) {
        this.amount = amount;
        this.claimant = claimant;
    }
    toPOD() {
        return {
            amount: this.amount,
            claimant: this.claimant.toBech()
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('ClaimableCoins');
        h.update(buffutils.fromUint64(this.amount));
        h.update(this.claimant.buffer);
        return h.digest();
    }
}
exports.default = ClaimableCoins;
//# sourceMappingURL=claimable-coins.js.map