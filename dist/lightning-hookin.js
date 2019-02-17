"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const Buffutils = require("./util/buffutils");
class LightningHookin {
    static fromPOD(data) {
        return new Error('todo...');
    }
    constructor(amount, creditTo, invoice) {
        this.amount = amount;
        this.creditTo = creditTo;
        this.invoice = invoice;
    }
    hash() {
        const builder = hash_1.default.newBuilder('LightningHookin');
        builder.update(Buffutils.fromUint64(this.amount));
        builder.update(this.creditTo.buffer);
        builder.update(Buffutils.fromString(this.invoice));
        return builder.digest();
    }
    toPOD() {
        return {
            amount: this.amount,
            creditTo: this.creditTo.toBech(),
            invoice: this.invoice,
        };
    }
}
exports.default = LightningHookin;
//# sourceMappingURL=lightning-hookin.js.map