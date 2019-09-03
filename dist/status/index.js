"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimed_1 = require("./claimed");
const failed_1 = require("./failed");
const bitcoin_transaction_sent_1 = require("./bitcoin-transaction-sent");
const invoice_settled_1 = require("./invoice-settled");
const lightning_payment_sent_1 = require("./lightning-payment-sent");
class Status {
    constructor(s) {
        this.s = s;
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
            return new Error('parseTransfer expected an object with a kind to parse');
        }
        const parser = findParser(obj.kind);
        if (parser instanceof Error) {
            return parser;
        }
        const parseResult = parser(obj);
        if (parseResult instanceof Error) {
            return parseResult;
        }
        const s = new Status(parseResult);
        if (s.hash().toPOD() !== obj.hash) {
            return new Error('status had mismatching hash');
        }
        return s;
    }
    toPOD() {
        return statusToPOD(this.s);
    }
    hash() {
        return this.s.hash();
    }
    get claimableHash() {
        return this.s.claimableHash;
    }
}
exports.default = Status;
function findParser(kind) {
    switch (kind) {
        case 'Failed':
            return failed_1.default.fromPOD;
        case 'BitcoinTransactionSent':
            return bitcoin_transaction_sent_1.default.fromPOD;
        case 'InvoiceSettled':
            return invoice_settled_1.default.fromPOD;
        case 'Claimed':
            return claimed_1.default.fromPOD;
        case 'LightningPaymentSent':
            return lightning_payment_sent_1.default.fromPOD;
        default:
            return new Error('Unknown status kind: ' + kind);
    }
}
function statusToPOD(s) {
    if (s instanceof bitcoin_transaction_sent_1.default) {
        return { kind: 'BitcoinTransactionSent', ...s.toPOD() };
    }
    else if (s instanceof failed_1.default) {
        return { kind: 'Failed', ...s.toPOD() };
    }
    else if (s instanceof invoice_settled_1.default) {
        return { kind: 'InvoiceSettled', ...s.toPOD() };
    }
    else if (s instanceof claimed_1.default) {
        return { kind: 'Claimed', ...s.toPOD() };
    }
    else if (s instanceof lightning_payment_sent_1.default) {
        return { kind: 'LightningPaymentSent', ...s.toPOD() };
    }
    else {
        const _ = s;
        throw new Error('uknown status: ' + s);
    }
}
//# sourceMappingURL=index.js.map