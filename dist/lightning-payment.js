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
        let fee = data.fee;
        if (!POD.isAmount(fee)) {
            return new Error('LightningPayment.fromPOD must have a int fee');
        }
        return new LightningPayment(data.paymentRequest, amount, fee);
    }
    constructor(paymentRequest, amount, fee) {
        this.paymentRequest = paymentRequest;
        this.amount = amount;
        this.fee = fee;
    }
    toPOD() {
        return {
            amount: this.amount,
            paymentRequest: this.paymentRequest,
            fee: this.fee,
        };
    }
    hash() {
        return LightningPayment.hashOf(this.paymentRequest, this.amount, this.fee);
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