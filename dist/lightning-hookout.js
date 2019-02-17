"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const Buffutils = require("./util/buffutils");
class LightningHookout {
    static fromPOD(data) {
        return new Error('TODO...');
    }
    constructor(invoice, amount) {
        this.invoice = invoice;
        this.amount = amount;
    }
    hash() {
        const builder = hash_1.default.newBuilder('LightningHookout');
        builder.update(Buffutils.fromString(this.invoice));
        return builder.digest();
    }
    toPOD() {
        return {
            amount: this.amount,
            invoice: this.invoice,
        };
    }
}
exports.default = LightningHookout;
//# sourceMappingURL=lightning-hookout.js.map