"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_status_1 = require("./abstract-status");
const hash_1 = require("../hash");
const buffutils = require("../util/buffutils");
const POD = require("../pod");
class LightningPaymentSent extends abstract_status_1.default {
    constructor(claimableHash, paymentPreimage, totalFees) {
        super(claimableHash);
        this.paymentPreimage = paymentPreimage;
        this.totalFees = totalFees;
    }
    hash() {
        return hash_1.default.fromMessage('LightningPaymentSent', this.buffer, this.paymentPreimage, buffutils.fromUint64(this.totalFees));
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimableHash: this.claimableHash.toPOD(),
            paymentPreimage: buffutils.toHex(this.paymentPreimage),
            totalFees: this.totalFees,
        };
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object') {
            return new Error('LightningPaymentSent.fromPOD expected an object');
        }
        const claimableHash = hash_1.default.fromPOD(obj.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const paymentPreimage = buffutils.fromHex(obj.paymentPreimage, 32);
        if (paymentPreimage instanceof Error) {
            return paymentPreimage;
        }
        const totalFees = obj.totalFees;
        if (!POD.isAmount(totalFees)) {
            return new Error('LightningPaymentSent.fromPOD expected a valid totalFees');
        }
        return new LightningPaymentSent(claimableHash, paymentPreimage, totalFees);
    }
}
exports.default = LightningPaymentSent;
//# sourceMappingURL=lightning-payment-sent.js.map