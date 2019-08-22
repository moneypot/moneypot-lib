"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_status_1 = require("./abstract-status");
const hash_1 = require("../hash");
const buffutils = require("../util/buffutils");
class BitcoinTransactionSent extends abstract_status_1.default {
    constructor(claimableHash, txid, vout) {
        super(claimableHash);
        this.txid = txid;
        this.vout = vout;
    }
    hash() {
        return hash_1.default.fromMessage('BitcoinTransactionSent', this.buffer, this.txid, buffutils.fromUint32(this.vout));
    }
    toPOD() {
        return {
            claimableHash: this.claimableHash.toPOD(),
            txid: buffutils.toHex(this.txid),
            vout: this.vout,
        };
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object') {
            return new Error('BitcoinTransactionSent.fromPOD expected an object');
        }
        const claimableHash = hash_1.default.fromPOD(obj.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const txid = buffutils.fromHex(obj.txid, 32);
        if (txid instanceof Error) {
            return txid;
        }
        const vout = obj.vout;
        if (!Number.isSafeInteger(vout) || vout < 0 || vout > 65536) {
            return new Error('BitcoinTransactionSent.fromPOD requires a valid vout');
        }
        return new BitcoinTransactionSent(claimableHash, txid, vout);
    }
}
exports.default = BitcoinTransactionSent;
//# sourceMappingURL=bitcoin-transaction-sent.js.map