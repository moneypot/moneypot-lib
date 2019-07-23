"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
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
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return new Error('LightningPayment.fromPOD must have a natural amount');
        }
        if (pro.satoshis && pro.satoshis !== amount) {
            return new Error('amount does not match invoice amount');
        }
        return new LightningPayment(data.paymentRequest, amount);
    }
    constructor(paymentRequest, amount) {
        this.paymentRequest = paymentRequest;
        this.amount = amount;
    }
    toPOD() {
        return {
            amount: this.amount,
            paymentRequest: this.paymentRequest,
        };
    }
    hash() {
        return LightningPayment.hashOf(this.paymentRequest, this.amount);
    }
    static hashOf(paymentRequest, amount) {
        const h = hash_1.default.newBuilder('LightningPayment');
        h.update(Buffutils.fromString(paymentRequest));
        h.update(Buffutils.fromUint64(amount));
        return h.digest();
    }
}
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map