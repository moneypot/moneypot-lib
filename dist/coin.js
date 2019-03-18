"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const magnitude_1 = require("./magnitude");
class Coin {
    static fromPOD(data) {
        const owner = public_key_1.default.fromBech(data.owner);
        if (owner instanceof Error) {
            return owner;
        }
        const magnitude = magnitude_1.default.fromPOD(data.magnitude);
        if (magnitude instanceof Error) {
            return magnitude;
        }
        const existenceProof = signature_1.default.fromBech(data.existenceProof);
        if (existenceProof instanceof Error) {
            return existenceProof;
        }
        return new Coin(owner, magnitude, existenceProof);
    }
    constructor(owner, magnitude, existenceProof) {
        this.owner = owner;
        this.magnitude = magnitude;
        this.existenceProof = existenceProof;
    }
    hash() {
        return hash_1.default.fromMessage('Coin', this.owner.buffer, this.magnitude.buffer, this.existenceProof.buffer);
    }
    toPOD() {
        return {
            existenceProof: this.existenceProof.toBech(),
            magnitude: this.magnitude.toPOD(),
            owner: this.owner.toBech(),
        };
    }
}
exports.default = Coin;
//# sourceMappingURL=coin.js.map