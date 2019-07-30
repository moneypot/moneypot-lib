"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const POD = require("./pod");
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const assert = require("./util/assert");
class Hookout {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('Hookout.fromPOD is not object');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('Hookout.fromPOD invalid amount');
        }
        const bitcoinAddress = data.bitcoinAddress;
        if (typeof bitcoinAddress !== 'string') {
            return new Error('Hookout.fromPOD invalid bitcoin address');
        }
        const priority = data.priority;
        if (['CUSTOM', 'IMMEDIATE', 'BATCH', 'FREE'].indexOf(priority) === -1) {
            return new Error('Unrecognized priority');
        }
        const fee = data.fee;
        if (!POD.isAmount(fee)) {
            return new Error('Hookout.fromPOD invalid fee');
        }
        const nonce = Buffutils.fromHex(data.nonce, 32);
        if (nonce instanceof Error) {
            return nonce;
        }
        return new Hookout(amount, bitcoinAddress, priority, fee, nonce);
    }
    constructor(amount, bitcoinAddress, priority, fee, nonce) {
        this.amount = amount;
        this.bitcoinAddress = bitcoinAddress;
        this.priority = priority;
        this.fee = fee;
        assert.equal(nonce.length, 32);
        this.nonce = nonce;
    }
    toPOD() {
        return {
            amount: this.amount,
            bitcoinAddress: this.bitcoinAddress,
            priority: this.priority,
            fee: this.fee,
            nonce: Buffutils.toHex(this.nonce),
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('Hookout');
        h.update(Buffutils.fromUint64(this.amount));
        h.update(Buffutils.fromString(this.bitcoinAddress));
        h.update(Buffutils.fromUint8(this.priority.charCodeAt(0)));
        h.update(Buffutils.fromUint64(this.fee));
        h.update(this.nonce);
        return h.digest();
    }
}
exports.default = Hookout;
//# sourceMappingURL=hookout.js.map