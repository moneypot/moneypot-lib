"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const nonce = Buffutils.fromHex(data.nonce, 32);
        if (nonce instanceof Error) {
            return nonce;
        }
        return new FeeBump(txid, nonce);
    }
    constructor(txid, nonce) {
        assert.equal(txid.length, 32);
        this.txid = txid;
        assert.equal(nonce.length, 32);
        this.nonce = nonce;
    }
    toPOD() {
        return {
            txid: Buffutils.toHex(this.txid),
            nonce: Buffutils.toHex(this.nonce),
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('Feebump');
        h.update(this.txid);
        h.update(this.nonce);
        return h.digest();
    }
}
exports.default = FeeBump;
//# sourceMappingURL=fee-bump.js.map