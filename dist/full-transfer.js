"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./util/assert");
const signature_1 = require("./signature");
const coin_1 = require("./coin");
const bounty_1 = require("./bounty");
const _1 = require(".");
const ecc_1 = require("./util/ecc");
const public_key_1 = require("./public-key");
const transfer_1 = require("./transfer");
const buffutils = require("./util/buffutils");
class FullTransfer {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('expected an object to deserialize a FullTransfer');
        }
        if (!Array.isArray(data.inputs)) {
            return new Error('expected an array for input in FullTransfer');
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
        const bounties = [];
        for (const b of data.bounties) {
            const bounty = bounty_1.default.fromPOD(b);
            if (bounty instanceof Error) {
                return bounty;
            }
            bounties.push(bounty);
        }
        if (!isHashSorted(bounties)) {
            return new Error('bounties are not in sorted order');
        }
        const hookout = data.hookout ? _1.Hookout.fromPOD(data.hookout) : undefined;
        if (hookout instanceof Error) {
            return hookout;
        }
        const authorization = signature_1.default.fromPOD(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new FullTransfer(inputs, bounties, hookout, authorization);
    }
    constructor(inputs, bounties, hookout, authorization) {
        assert_1.default(isHashSorted(inputs));
        this.inputs = inputs;
        assert_1.default(isHashSorted(bounties));
        this.bounties = bounties;
        this.hookout = hookout;
        this.authorization = authorization;
    }
    hash() {
        return transfer_1.default.hashOf(this.inputs.map(i => i.hash()), this.bounties.map(b => b.hash()), this.hookout ? this.hookout.hash() : undefined);
    }
    toPOD() {
        return {
            authorization: this.authorization.toPOD(),
            bounties: this.bounties.map(b => b.toPOD()),
            hookout: this.hookout ? this.hookout.toPOD() : undefined,
            inputs: this.inputs.map(b => b.toPOD()),
        };
    }
    fee() {
        return this.inputAmount() - this.outputAmount();
    }
    inputAmount() {
        let amount = 0;
        for (const coin of this.inputs) {
            amount += coin.amount;
        }
        return amount;
    }
    outputAmount() {
        let amount = this.hookout ? this.hookout.amount : 0;
        for (const bounty of this.bounties) {
            amount += bounty.amount;
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
        return new transfer_1.default(this.inputs, this.bounties.map(b => b.hash()), this.hookout ? this.hookout.hash() : undefined, this.authorization);
    }
}
exports.default = FullTransfer;
function isHashSorted(ts) {
    for (let i = 1; i < ts.length; i++) {
        const c = buffutils.compare(ts[i - 1].hash().buffer, ts[i].hash().buffer);
        if (c > 0) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=full-transfer.js.map