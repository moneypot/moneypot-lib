"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const failed_1 = require("./failed");
const claimed_1 = require("./claimed");
const lightning_payment_sent_1 = require("./lightning-payment-sent");
function computeClaimableRemaining(claimable, statuses) {
    const c = claimable.c;
    let remaining = c.amount;
    for (const { s } of statuses) {
        if (s instanceof failed_1.default) {
            remaining += s.rebate;
        }
        else if (s instanceof claimed_1.default) {
            remaining -= s.claimRequest.amount();
        }
        else if (s instanceof lightning_payment_sent_1.default) {
            const overpaid = c.fee - s.totalFees;
            if (overpaid <= 0) {
                throw new Error('assertion failed, actual lightning fees higher than paid: ' + claimable.hash);
            }
            remaining += overpaid;
        }
    }
    if (remaining < 0) {
        throw new Error('assertion failed, claimable remaining is less than 0: ' + claimable.hash);
    }
    return remaining;
}
exports.default = computeClaimableRemaining;
//# sourceMappingURL=compute-claimable-remaining.js.map