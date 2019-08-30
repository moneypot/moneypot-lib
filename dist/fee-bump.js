"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const assert = require("./util/assert");
const abstract_transfer_1 = require("./abstract-transfer");
class FeeBump extends abstract_transfer_1.default {
    static fromPOD(data) {
        const transferData = abstract_transfer_1.parseTransferData(data);
        if (transferData instanceof Error) {
            throw transferData;
        }
        const txid = Buffutils.fromHex(data.txid, 32);
        if (typeof txid !== 'string') {
            return new Error('FeeBump.fromPOD invalid txid');
        }
        return new FeeBump(transferData, txid);
    }
    get kind() {
        return 'FeeBump';
    }
    constructor(transferData, txid) {
        super(transferData);
        this.txid = txid;
        assert.equal(txid.length, 32);
        this.txid = txid;
    }
    toPOD() {
        return {
            ...super.toPOD(),
            txid: Buffutils.toHex(this.txid),
        };
    }
    static hashOf(transferHash, txid) {
        return hash_1.default.fromMessage('FeeBump', transferHash.buffer, txid);
    }
    hash() {
        return FeeBump.hashOf(abstract_transfer_1.default.transferHash(this), this.txid);
    }
}
exports.default = FeeBump;
//# sourceMappingURL=fee-bump.js.map