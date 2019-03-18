"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const POD = require("./pod");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const Buffutils = require("./util/buffutils");
class Coin {
    static fromPOD(data) {
        const owner = public_key_1.default.fromBech(data.owner);
        if (owner instanceof Error) {
            return owner;
        }
        const magnitude = data.magnitude;
        if (!POD.isMagnitude(magnitude)) {
            return new Error('invalid magnitude for coin');
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
        return hash_1.default.fromMessage('Coin', this.owner.buffer, Buffutils.fromUint8(this.magnitude), this.existenceProof.buffer);
    }
    toPOD() {
        return {
            existenceProof: this.existenceProof.toBech(),
            magnitude: this.magnitude,
            owner: this.owner.toBech(),
        };
    }
}
exports.default = Coin;
//# sourceMappingURL=coin.js.map