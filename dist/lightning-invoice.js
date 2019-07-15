"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const hash_1 = require("./hash");
const buffutils = require("./util/buffutils");
class LightningInvoice {
    constructor(beneficiary, paymentRequest) {
        this.beneficiary = beneficiary;
        this.paymentRequest = paymentRequest;
    }
    hash() {
        return hash_1.default.fromMessage('LightningInvoice', this.beneficiary.buffer, buffutils.fromString(this.paymentRequest));
    }
    toPOD() {
        return {
            beneficiary: this.beneficiary.toPOD(),
            paymentRequest: this.paymentRequest,
        };
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('LightningInvoice.fromPOD expected an object');
        }
        // should we use bolt11 to validate the payment request?
        const beneficiary = public_key_1.default.fromPOD(data.beneficiary);
        if (beneficiary instanceof Error) {
            return new Error('lightninginvoice needs a publickey beneficiary');
        }
        const paymentRequest = data.paymentRequest;
        if (typeof paymentRequest !== 'string' || !paymentRequest.startsWith('ln')) {
            return new Error('expected valid payment request for lightninginvoice');
        }
        return {
            beneficiary,
            paymentRequest,
        };
    }
}
exports.default = LightningInvoice;
//# sourceMappingURL=lightning-invoice.js.map