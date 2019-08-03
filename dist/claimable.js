"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookout_1 = require("./hookout");
const fee_bump_1 = require("./fee-bump");
const lightning_payment_1 = require("./lightning-payment");
const lightning_invoice_1 = require("./lightning-invoice");
const hookin_1 = require("./hookin");
function podToClaimable(obj) {
    if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
        return new Error('parseTransfer expected an object with a kind to parse');
    }
    switch (obj.kind) {
        case 'Hookout':
            return hookout_1.default.fromPOD(obj);
        case 'FeeBump':
            return fee_bump_1.default.fromPOD(obj);
        case 'LightningPayment':
            return lightning_payment_1.default.fromPOD(obj);
        default:
            throw new Error('parseTransfer unknown kind: ' + obj.kind);
    }
}
exports.podToClaimable = podToClaimable;
function claimableToPod(c) {
    if (c instanceof hookout_1.default) {
        return { kind: 'Hookout', ...c.toPOD() };
    }
    if (c instanceof fee_bump_1.default) {
        return { kind: 'FeeBump', ...c.toPOD() };
    }
    if (c instanceof lightning_payment_1.default) {
        return { kind: 'LightningPayment', ...c.toPOD() };
    }
    if (c instanceof lightning_invoice_1.default) {
        return { kind: 'LightningInvoice', ...c.toPOD() };
    }
    if (c instanceof hookin_1.default) {
        return { kind: 'Hookin', ...c.toPOD() };
    }
    const _ = c;
    console.error('unknown claimable ', c);
    throw new Error('unknown claimable');
}
exports.claimableToPod = claimableToPod;
//# sourceMappingURL=claimable.js.map