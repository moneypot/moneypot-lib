"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_status_1 = require("./abstract-status");
const hash_1 = require("../hash");
const buffutils = require("../util/buffutils");
const POD = require("../pod");
class InvoiceSettled extends abstract_status_1.default {
    constructor(claimableHash, amount, rPreimage, time) {
        super(claimableHash);
        this.amount = amount;
        this.rPreimage = rPreimage;
        this.time = time;
    }
    hash() {
        return hash_1.default.fromMessage('InvoiceSettled', this.buffer, buffutils.fromUint64(this.amount), this.rPreimage, buffutils.fromUint64(this.time.getTime()));
    }
    toPOD() {
        return {
            claimableHash: this.claimableHash.toPOD(),
            amount: this.amount,
            rPreimage: buffutils.toHex(this.rPreimage),
            time: this.time.toISOString(),
        };
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object') {
            return new Error('InvoiceSettled.fromPOD expected an object');
        }
        const claimableHash = hash_1.default.fromPOD(obj.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const amount = obj.amount;
        if (!POD.isAmount(amount)) {
            return new Error('InvoiceSettled.fromPOD expected a valid amount');
        }
        const rPreimage = buffutils.fromHex(obj.rPreimage, 32);
        if (rPreimage instanceof Error) {
            return rPreimage;
        }
        const ms = Date.parse(obj.time);
        if (!Number.isFinite(ms)) {
            return new Error('InvoiceSettled.fromPOD expected a valid time');
        }
        const time = new Date(ms);
        if (time.toISOString() !== obj.time) {
            // canonical check...
            return new Error('InvoiceSettled.fromPOD got a strangely formatted time');
        }
        return new InvoiceSettled(claimableHash, amount, rPreimage, time);
    }
}
exports.default = InvoiceSettled;
//# sourceMappingURL=invoice-settled.js.map