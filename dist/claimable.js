"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acknowledged = require("./acknowledged");
const parsers = new Map([
    ['Hookout', acknowledged.hookinFromPod],
    ['FeeBump', acknowledged.feeBumpFromPod],
    ['LightningPayment', acknowledged.lightningPaymentFromPod],
    ['LightningInvoice', acknowledged.lightningInvoiceFromPod],
    ['Hookin', acknowledged.hookinFromPod]
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
function claimableToPod(c) {
    const kind = c.contents.constructor.name;
    if (!parsers.has(kind)) {
        throw new Error('could not serialize a: ' + kind + ' as we have no parsers for such a thing');
    }
    return { kind, ...c.toPOD() };
}
exports.claimableToPod = claimableToPod;
//# sourceMappingURL=claimable.js.map