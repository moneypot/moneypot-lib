"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_status_1 = require("./abstract-status");
const hash_1 = require("../hash");
const buffutils = require("../util/buffutils");
const POD = require("../pod");
class Failed extends abstract_status_1.default {
    constructor(claimableHash, reason, rebate) {
        super(claimableHash);
        this.reason = reason;
        this.rebate = rebate;
    }
    hash() {
        return hash_1.default.fromMessage('Failed', this.buffer, buffutils.fromString(this.reason), buffutils.fromUint64(this.rebate));
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimableHash: this.claimableHash.toPOD(),
            reason: this.reason,
            rebate: this.rebate,
        };
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object') {
            return new Error('Failed.fromPOD expected an object');
        }
        const claimableHash = hash_1.default.fromPOD(obj.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const reason = obj.reason;
        if (typeof reason !== 'string') {
            return new Error('Failed.fromPOD expected a string reason');
        }
        const rebate = obj.rebate;
        if (!POD.isAmount(rebate)) {
            return new Error('rebate is not an amount');
        }
        return new Failed(claimableHash, reason, rebate);
    }
}
exports.default = Failed;
//# sourceMappingURL=failed.js.map