"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./util/assert");
const public_key_1 = require("./public-key");
const signature_1 = require("./signature");
const coin_1 = require("./coin");
const _1 = require(".");
const ecc_1 = require("./util/ecc");
const change_1 = require("./change");
const transfer_1 = require("./transfer");
const buffutils = require("./util/buffutils");
class BitcoinTransfer {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('expected an object to deserialize a BitcoinTransfer');
        }
        if (!Array.isArray(data.inputs)) {
            return new Error('expected an array for input in BitcoinTransfer');
        }
        const inputs = [];
        for (const i of data.inputs) {
            const input = coin_1.default.fromPOD(i);
            if (input instanceof Error) {
                return input;
            }
            inputs.push(input);
        }
        if (!isHashSorted(inputs)) {
            return new Error('inputs are not in sorted order');
        }
        if (typeof data.output !== 'object') {
            return new Error('expected object for data in BitcoinTransfer');
        }
        const output = _1.Hookout.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        const change = change_1.default.fromPOD(data.change);
        if (change instanceof Error) {
            return change;
        }
        const authorization = signature_1.default.fromPOD(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new BitcoinTransfer(inputs, output, change, authorization);
    }
    constructor(inputs, output, change, authorization) {
        assert_1.default(isHashSorted(inputs));
        this.inputs = inputs;
        this.change = change;
        this.output = output;
        this.authorization = authorization;
    }
    hash() {
        return transfer_1.default.hashOf(this.inputs.map(i => i.hash()), this.output.hash(), this.change.hash());
    }
    toPOD() {
        return {
            inputs: this.inputs.map(b => b.toPOD()),
            output: this.output.toPOD(),
            change: this.change.toPOD(),
            authorization: this.authorization.toPOD(),
        };
    }
    fee() {
        return this.inputAmount() - (this.output.amount + this.change.amount);
    }
    inputAmount() {
        let amount = 0;
        for (const coin of this.inputs) {
            amount += coin.amount;
        }
        return amount;
    }
    isValid() {
        if (this.fee() < 0) {
            return false;
        }
        const p = ecc_1.muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
        const pubkey = new public_key_1.default(p.x, p.y);
        return this.authorization.verify(this.hash().buffer, pubkey);
    }
    prune() {
        return new transfer_1.default(this.inputs, this.output.hash(), this.change.hash(), this.authorization);
    }
}
exports.default = BitcoinTransfer;
function isHashSorted(ts) {
    for (let i = 1; i < ts.length; i++) {
        const c = buffutils.compare(ts[i - 1].hash().buffer, ts[i].hash().buffer);
        if (c > 0) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=bitcoin-transfer.js.map