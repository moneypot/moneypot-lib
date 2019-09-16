"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_status_1 = require("./abstract-status");
const hash_1 = require("../hash");
const POD = require("../pod");
const buffutils = require("../util/buffutils");
class HookinAccepted extends abstract_status_1.default {
    constructor(claimableHash, consolidationFee) {
        super(claimableHash);
        this.consolidationFee = consolidationFee;
    }
    hash() {
        const h = hash_1.default.newBuilder('HookinAccepted');
        h.update(this.claimableHash.buffer);
        h.update(buffutils.fromUint64(this.consolidationFee));
        return h.digest();
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimableHash: this.claimableHash.toPOD(),
            consolidationFee: this.consolidationFee,
        };
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            throw new Error('HookinAccepted.fromPOD must take an object');
        }
        const claimableHash = hash_1.default.fromPOD(data.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const consolidationFee = data.consolidationFee;
        if (!POD.isAmount(consolidationFee)) {
            throw new Error('HookinAccepted.fromPOD expected an amount consolidation fee');
        }
        return new HookinAccepted(claimableHash, consolidationFee);
    }
}
exports.default = HookinAccepted;
//# sourceMappingURL=hookin-accepted.js.map