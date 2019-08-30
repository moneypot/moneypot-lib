"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const bolt11 = require("./bolt11");
const abstract_transfer_1 = require("./abstract-transfer");
class LightningPayment extends abstract_transfer_1.default {
    static fromPOD(data) {
        const transferData = abstract_transfer_1.parseTransferData(data);
        if (transferData instanceof Error) {
            throw transferData;
        }
        let pro;
        try {
            pro = bolt11.decodeBolt11(data.paymentRequest);
        }
        catch (err) {
            console.warn('warn: bolt11 decode error: ', err);
            return err;
        }
        if (pro.satoshis && pro.satoshis !== transferData.amount) {
            return new Error('amount does not match invoice amount');
        }
        return new LightningPayment(transferData, data.paymentRequest);
    }
    get kind() {
        return 'LightningPayment';
    }
    constructor(transferData, paymentRequest) {
        super(transferData);
        this.paymentRequest = paymentRequest;
    }
    toPOD() {
        return {
            ...super.toPOD(),
            paymentRequest: this.paymentRequest,
        };
    }
    static hashOf(transferDataHash, paymentRequest) {
        return hash_1.default.fromMessage('LightningPayment', transferDataHash.buffer, Buffutils.fromString(paymentRequest));
    }
    hash() {
        return LightningPayment.hashOf(abstract_transfer_1.default.transferHash(this), this.paymentRequest);
    }
}
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map