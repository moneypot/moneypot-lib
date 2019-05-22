"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const Buffutils = require("./util/buffutils");
const POD = require("./pod");
const assert = require("./util/assert");
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
        const nonce = Buffutils.fromHex(data.nonce, 32);
        if (nonce instanceof Error) {
            return nonce;
        }
        return new Change(amount, claimant, nonce);
    }
    constructor(amount, claimant, nonce) {
        this.amount = amount;
        this.claimant = claimant;
        assert.equal(nonce.length, 32);
        this.nonce = nonce;
    }
    toPOD() {
        return {
            amount: this.amount,
            claimant: this.claimant.toPOD(),
            nonce: Buffutils.toHex(this.nonce),
        };
    }
    get buffer() {
        return Buffutils.concat(Buffutils.fromUint64(this.amount), this.claimant.buffer, this.nonce);
    }
    hash() {
        return hash_1.default.fromMessage('Change', this.buffer);
    }
}
exports.default = Change;
//# sourceMappingURL=change.js.map