"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const magnitude_1 = require("./magnitude");
const Buffutils = require("./util/buffutils");
class Coin {
    static fromPOD(data) {
        const owner = public_key_1.default.fromPOD(data.owner);
        if (owner instanceof Error) {
            return owner;
        }
        const magnitude = magnitude_1.default.fromPOD(data.magnitude);
        if (magnitude instanceof Error) {
            return magnitude;
        }
        const receipt = signature_1.default.fromPOD(data.receipt);
        if (receipt instanceof Error) {
            return receipt;
        }
        const c = new Coin(owner, magnitude, receipt);
        if (c.hash().toPOD() !== data.hash) {
            return new Error('hash did not match');
        }
        return c;
    }
    constructor(owner, magnitude, receipt) {
        this.owner = owner;
        this.magnitude = magnitude;
        this.receipt = receipt;
    }
    get buffer() {
        return Buffutils.concat(this.owner.buffer, this.magnitude.buffer, this.receipt.buffer);
    }
    hash() {
        return hash_1.default.fromMessage('Coin', this.buffer);
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            receipt: this.receipt.toPOD(),
            magnitude: this.magnitude.toPOD(),
            owner: this.owner.toPOD(),
        };
    }
    get amount() {
        return this.magnitude.toAmount();
    }
}
exports.default = Coin;
//# sourceMappingURL=coin.js.map