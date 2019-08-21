"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hookout_1 = require("./hookout");
const fee_bump_1 = require("./fee-bump");
const lightning_payment_1 = require("./lightning-payment");
const lightning_invoice_1 = require("./lightning-invoice");
const hookin_1 = require("./hookin");
class Claimable {
    constructor(c) {
        this.c = c;
    }
    hash() {
        return this.c.hash();
    }
    toPOD() {
        if (this.c instanceof hookout_1.default) {
            return { kind: 'Hookout', ...this.c.toPOD() };
        }
        else if (this.c instanceof fee_bump_1.default) {
            return { kind: 'FeeBump', ...this.c.toPOD() };
        }
        else if (this.c instanceof lightning_payment_1.default) {
            return { kind: 'LightningPayment', ...this.c.toPOD() };
        }
        else if (this.c instanceof lightning_invoice_1.default) {
            return { kind: 'LightningInvoice', ...this.c.toPOD() };
        }
        else if (this.c instanceof hookin_1.default) {
            return { kind: 'Hookin', ...this.c.toPOD() };
        }
        else {
            const _ = this.c;
            throw new Error('unknown claimable kind');
        }
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object') {
            return new Error('Claimable.fromPOD expected an object');
        }
        if (typeof obj.kind !== 'string') {
            return new Error('Claimable.fromPOD expected a string kind');
        }
        const parser = parserFromKind(obj.kind);
        if (!parser) {
            return new Error('Claimble.fromPOD couldnt handle that kind');
        }
        const parseRes = parser(obj);
        if (parseRes instanceof Error) {
            return parseRes;
        }
        return new Claimable(parseRes);
    }
}
exports.default = Claimable;
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