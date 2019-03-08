"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const POD = require("./pod");
const hash_1 = require("./hash");
const buffutils = require("./util/buffutils");
class ClaimableCoin {
    static fromPOD(data) {
        const claimant = public_key_1.default.fromBech(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        const magnitude = data.magnitude;
        if (!POD.isMagnitude(magnitude)) {
            return new Error('invalid magnitude');
        }
        return new ClaimableCoin(claimant, magnitude);
    }
    constructor(claimant, magnitude) {
        this.claimant = claimant;
        this.magnitude = magnitude;
    }
    hash() {
        const h = hash_1.default.newBuilder('ClaimableCoin');
        h.update(this.claimant.buffer);
        h.update(buffutils.fromUint8(this.magnitude));
        return h.digest();
    }
    toPOD() {
        return {
            claimant: this.claimant.toBech(),
            magnitude: this.magnitude,
        };
    }
}
exports.default = ClaimableCoin;
//# sourceMappingURL=claimable-coin.js.map