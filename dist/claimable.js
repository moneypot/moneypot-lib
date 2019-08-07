"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acknowledged = require("./acknowledged");
const hookout_1 = require("./hookout");
const fee_bump_1 = require("./fee-bump");
const lightning_payment_1 = require("./lightning-payment");
const lightning_invoice_1 = require("./lightning-invoice");
const hookin_1 = require("./hookin");
const parsers = new Map([
    ['Hookout', acknowledged.hookinFromPod],
    ['FeeBump', acknowledged.feeBumpFromPod],
    ['LightningPayment', acknowledged.lightningPaymentFromPod],
    ['LightningInvoice', acknowledged.lightningInvoiceFromPod],
    ['Hookin', acknowledged.hookinFromPod],
]);
function podToClaimable(obj) {
    if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
        return new Error('parseTransfer expected an object with a kind to parse');
    }
    const parser = parsers.get(obj.kind);
    if (!parser) {
        return new Error('could not parse a: ' + obj.kind);
    }
    return parser(obj);
}
exports.podToClaimable = podToClaimable;
function claimableToPod(claimable) {
    const c = claimable.contents;
    if (c instanceof hookout_1.default) {
        return { kind: 'Hookout', ...c.toPOD() };
    }
    else if (c instanceof fee_bump_1.default) {
        return { kind: 'FeeBump', ...c.toPOD() };
    }
    else if (c instanceof lightning_payment_1.default) {
        return { kind: 'LightningPayment', ...c.toPOD() };
    }
    else if (c instanceof lightning_invoice_1.default) {
        return { kind: 'LightningInvoice', ...c.toPOD() };
    }
    else if (c instanceof hookin_1.default) {
        return { kind: 'Hookin', ...c.toPOD() };
    }
    else {
        const _ = c;
        throw new Error('did not know what a: ' + c + ' is');
    }
}
exports.claimableToPod = claimableToPod;
//# sourceMappingURL=claimable.js.map