"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const failed_1 = __importDefault(require("./failed"));
const claimed_1 = __importDefault(require("./claimed"));
const lightning_payment_sent_1 = __importDefault(require("./lightning-payment-sent"));
const bitcoin_transaction_sent_1 = __importDefault(require("./bitcoin-transaction-sent"));
const invoice_settled_1 = __importDefault(require("./invoice-settled"));
const hookin_accepted_1 = __importDefault(require("./hookin-accepted"));
const hookin_1 = __importDefault(require("../hookin"));
const lightning_payment_1 = __importDefault(require("../lightning-payment"));
function computeClaimableRemaining(c, statuses) {
    let remaining = c.claimableAmount;
    for (const s of statuses) {
        if (s instanceof failed_1.default) {
            remaining += s.rebate;
        }
        else if (s instanceof claimed_1.default) {
            remaining -= s.claimRequest.amount();
        }
        else if (s instanceof lightning_payment_sent_1.default) {
            if (!(c instanceof lightning_payment_1.default)) {
                throw new Error('got lighting payment sent status for a non lightning payment?');
            }
            const overpaid = c.fee - s.totalFees;
            if (overpaid < 0) {
                throw new Error('assertion failed, actual lightning fees higher than paid: ' + c.hash().toPOD());
            }
            remaining += overpaid;
        }
        else if (s instanceof invoice_settled_1.default) {
            remaining += s.amount;
        }
        else if (s instanceof bitcoin_transaction_sent_1.default) {
            // do nothing
        }
        else if (s instanceof hookin_accepted_1.default) {
            if (!(c instanceof hookin_1.default)) {
                throw new Error('assertion failure. hookin accepted for non-hookin?!');
            }
            remaining += Math.max(c.amount - s.consolidationFee, 0);
        }
        else {
            const _ = s;
            throw new Error('Unexpected Status: ' + s);
        }
    }
    if (remaining < 0) {
        throw new Error('assertion failed, claimable remaining is less than 0: ' + c.hash().toPOD());
    }
    return remaining;
}
exports.default = computeClaimableRemaining;
//# sourceMappingURL=compute-claimable-remaining.js.map