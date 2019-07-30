"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const POD = require("./pod");
const hash_1 = require("./hash");
const bolt11 = require("./bolt11");
class LightningPayment {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('LightningPayment.fromPOD is not an object');
        }
        let pro;
        try {
            pro = bolt11.decodeBolt11(data.paymentRequest);
        }
        catch (err) {
            console.warn('warn: bolt11 decode error: ', err);
            return err;
        }
        let amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('LightningPayment.fromPOD must have a int amount');
        }
        if (pro.satoshis && pro.satoshis !== amount) {
            return new Error('amount does not match invoice amount');
        }
        let feeLimit = data.feeLimit;
        if (!POD.isAmount(feeLimit)) {
            return new Error('LightningPayment.fromPOD must have a int feeLimit');
        }
        return new LightningPayment(data.paymentRequest, amount, feeLimit);
    }
    constructor(paymentRequest, amount, feeLimit) {
        this.paymentRequest = paymentRequest;
        this.amount = amount;
        this.feeLimit = feeLimit;
    }
    toPOD() {
        return {
            amount: this.amount,
            paymentRequest: this.paymentRequest,
            feeLimit: this.feeLimit,
        };
    }
    hash() {
        return LightningPayment.hashOf(this.paymentRequest, this.amount, this.feeLimit);
    }
    static hashOf(paymentRequest, amount, feeLimit) {
        const h = hash_1.default.newBuilder('LightningPayment');
        h.update(Buffutils.fromString(paymentRequest));
        h.update(Buffutils.fromUint64(amount));
        h.update(Buffutils.fromUint64(feeLimit));
        return h.digest();
    }
}
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map