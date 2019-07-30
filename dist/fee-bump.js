"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const POD = require("./pod");
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const assert = require("./util/assert");
class FeeBump {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('FeeBump.fromPOD is not object');
        }
        const txid = Buffutils.fromHex(data.txid, 32);
        if (typeof txid !== 'string') {
            return new Error('FeeBump.fromPOD invalid txid');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('FeeBump.fromPOD needs an amount');
        }
        const nonce = Buffutils.fromHex(data.nonce, 32);
        if (nonce instanceof Error) {
            return nonce;
        }
        return new FeeBump(txid, nonce, amount);
    }
    constructor(txid, nonce, amount) {
        assert.equal(txid.length, 32);
        this.txid = txid;
        assert.equal(nonce.length, 32);
        this.nonce = nonce;
        this.amount = amount;
    }
    toPOD() {
        return {
            txid: Buffutils.toHex(this.txid),
            nonce: Buffutils.toHex(this.nonce),
            amount: this.amount,
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('FeeBump');
        h.update(this.txid);
        h.update(this.nonce);
        h.update(Buffutils.fromUint64(this.amount));
        return h.digest();
    }
}
exports.default = FeeBump;
//# sourceMappingURL=fee-bump.js.map