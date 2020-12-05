"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const hash_1 = require("./hash");
const buffutils = require("./util/buffutils");
class LightningInvoice {
    constructor(claimant, paymentRequest, initCreated) {
        this.claimant = claimant;
        this.paymentRequest = paymentRequest;
        this.initCreated = initCreated;
    }
    hash() {
        return hash_1.default.fromMessage('LightningInvoice', this.claimant.buffer, buffutils.fromString(this.paymentRequest));
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimant: this.claimant.toPOD(),
            paymentRequest: this.paymentRequest,
            initCreated: this.initCreated,
        };
    }
    get fee() {
        return 0;
    }
    get amount() {
        return 0;
    }
    get claimableAmount() {
        return 0;
    }
    get kind() {
        return 'LightningInvoice';
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('LightningInvoice.fromPOD expected an object');
        }
        // should we use bolt11 to validate the payment request?
        const claimant = public_key_1.default.fromPOD(data.claimant);
        if (claimant instanceof Error) {
            return new Error('lightninginvoice needs a publickey claimant');
        }
        const paymentRequest = data.paymentRequest;
        if (typeof paymentRequest !== 'string' || !paymentRequest.startsWith('ln')) {
            return new Error('expected valid payment request for lightninginvoice');
        }
        const initCreated = data.initCreated;
        if (initCreated) {
            if (typeof initCreated != 'number') {
                throw initCreated;
            }
        }
        return new LightningInvoice(claimant, paymentRequest, initCreated);
    }
}
exports.default = LightningInvoice;
//# sourceMappingURL=lightning-invoice.js.map