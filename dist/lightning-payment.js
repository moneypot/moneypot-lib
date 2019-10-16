"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const bolt11 = require("./bolt11");
const abstract_transfer_1 = require("./abstract-transfer");
class LightningPayment extends abstract_transfer_1.default {
    constructor(transferData, paymentRequest) {
        super(transferData);
        this.paymentRequest = paymentRequest;
        let pro = bolt11.decodeBolt11(paymentRequest);
        if (pro instanceof Error) {
            throw 'invalid bolt11 invoice: ' + pro.message;
        }
        if (pro.satoshis && pro.satoshis !== transferData.amount) {
            throw 'amount does not match invoice amount';
        }
    }
    static fromPOD(data) {
        const transferData = abstract_transfer_1.parseTransferData(data);
        if (transferData instanceof Error) {
            return transferData;
        }
        try {
            return new LightningPayment(transferData, data.paymentRequest);
        }
        catch (err) {
            return new Error(err);
        }
    }
    get kind() {
        return 'LightningPayment';
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