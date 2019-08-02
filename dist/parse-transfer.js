"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookout_1 = require("./hookout");
const fee_bump_1 = require("./fee-bump");
const lightning_invoice_1 = require("./lightning-invoice");
function parseTransfer(obj) {
    if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
        return new Error('parseTransfer expected an object with a kind to parse');
    }
    switch (obj.kind) {
        case 'Hookout':
            return hookout_1.default.fromPOD(obj);
        case 'FeeBump':
            return fee_bump_1.default.fromPOD(obj);
        case 'LightningPayment':
            return lightning_invoice_1.default.fromPOD(obj);
        default:
            throw new Error('parseTransfer unknown kind: ' + obj.kind);
    }
}
exports.parseTransfer = parseTransfer;
//# sourceMappingURL=parse-transfer.js.map