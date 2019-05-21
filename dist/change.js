"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const Buffutils = require("./util/buffutils");
const POD = require("./pod");
class Change {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('Change was expected to be an object');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('Change should be a positive integer');
        }
        const claimant = public_key_1.default.fromPOD(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        return new Change(amount, claimant);
    }
    constructor(amount, claimant) {
        this.amount = amount;
        this.claimant = claimant;
    }
    toPOD() {
        return {
            amount: this.amount,
            claimant: this.claimant.toPOD(),
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('Change');
        h.update(Buffutils.fromUint64(this.amount));
        h.update(this.claimant.buffer);
        return h.digest();
    }
}
exports.default = Change;
//# sourceMappingURL=change.js.map