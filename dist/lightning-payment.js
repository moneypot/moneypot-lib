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
        return this.paymentRequestObject.paymentRequest;
    }
    hash() {
        return LightningPayment.hashOf(this.paymentRequestObject.paymentRequest);
    }
    static hashOf(paymentRequest) {
        const h = hash_1.default.newBuilder('LightningPayment');
        h.update(Buffutils.fromString(paymentRequest));
        return h.digest();
    }
}
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map