"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const claimed_1 = __importDefault(require("./claimed"));
const failed_1 = __importDefault(require("./failed"));
const bitcoin_transaction_sent_1 = __importDefault(require("./bitcoin-transaction-sent"));
const invoice_settled_1 = __importDefault(require("./invoice-settled"));
const lightning_payment_sent_1 = __importDefault(require("./lightning-payment-sent"));
const hookin_accepted_1 = __importDefault(require("./hookin-accepted"));
function statusFromPOD(obj) {
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
    if (parseResult.hash().toPOD() !== obj.hash) {
        return new Error('status had mismatching hash');
    }
    return parseResult;
}
exports.statusFromPOD = statusFromPOD;
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
        case 'HookinAccepted':
            return hookin_accepted_1.default.fromPOD;
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
    else if (s instanceof hookin_accepted_1.default) {
        return { kind: 'HookinAccepted', ...s.toPOD() };
    }
    else {
        const _ = s;
        throw new Error('uknown status: ' + s);
    }
}
exports.statusToPOD = statusToPOD;
//# sourceMappingURL=index.js.map