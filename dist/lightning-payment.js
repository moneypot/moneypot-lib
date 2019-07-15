"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const bolt11 = require("./bolt11");
class LightningPayment {
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('LightningPayment.fromPOD is not string');
        }
        let pro;
        try {
            pro = bolt11.decodeBolt11(data);
        }
        catch (err) {
            console.warn('warn: bolt11 decode error: ', err);
            return new Error('could not decode lightning paymentRequest');
        }
        return new LightningPayment(pro);
    }
    constructor(paymentRequestObject) {
        this.paymentRequestObject = paymentRequestObject;
    }
    toPOD() {
        return bolt11.encodeBolt11(this.paymentRequestObject);
    }
    hash() {
        return LightningPayment.hashOf(this.toPOD());
    }
    static hashOf(paymentRequest) {
        const h = hash_1.default.newBuilder('LightningPayment');
        h.update(Buffutils.fromString(paymentRequest));
        return h.digest();
    }
    get amount() {
        return this.paymentRequestObject.satoshis;
    }
    setAmount(satoshis) {
        this.paymentRequestObject.satoshis = satoshis;
        this.paymentRequestObject.millisatoshis = BigInt(satoshis) * BigInt(1000);
    }
}
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map