"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hookout_1 = __importDefault(require("./hookout"));
const fee_bump_1 = __importDefault(require("./fee-bump"));
const lightning_payment_1 = __importDefault(require("./lightning-payment"));
const lightning_invoice_1 = __importDefault(require("./lightning-invoice"));
const hookin_1 = __importDefault(require("./hookin"));
function claimableToPOD(c) {
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
        throw new Error('unknown claimable kind');
    }
}
exports.claimableToPOD = claimableToPOD;
function claimableFromPOD(obj) {
    if (typeof obj !== 'object') {
        return new Error('claimableFromPOD expected an object');
    }
    if (typeof obj.kind !== 'string') {
        return new Error('claimableFromPOD expected a string kind');
    }
    const parser = parserFromKind(obj.kind);
    if (!parser) {
        return new Error('claimableFromPODcouldnt handle that kind');
    }
    const c = parser(obj);
    if (c instanceof Error) {
        return c;
    }
    if (c.hash().toPOD() !== obj.hash) {
        return new Error('hash did not match');
    }
    return c;
}
exports.claimableFromPOD = claimableFromPOD;
function parserFromKind(kind) {
    switch (kind) {
        case 'Hookout':
            return hookout_1.default.fromPOD;
        case 'FeeBump':
            return fee_bump_1.default.fromPOD;
        case 'LightningPayment':
            return lightning_payment_1.default.fromPOD;
        case 'LightningInvoice':
            return lightning_invoice_1.default.fromPOD;
        case 'Hookin':
            return hookin_1.default.fromPOD;
    }
}
exports.parserFromKind = parserFromKind;
// export function podToClaimable(obj: any): Claimable | Error {
//   if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
//     return new Error('parseTransfer expected an object with a kind to parse');
//   }
//   const parser = parsers.get(obj.kind);
//   if (!parser) {
//     return new Error('could not parse a: ' + obj.kind);
//   }
//   return parser(obj);
// }
//# sourceMappingURL=claimable.js.map