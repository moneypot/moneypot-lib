"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const signature_1 = require("./signature");
const hset_1 = require("./hset");
const coin_1 = require("./coin");
const bounty_1 = require("./bounty");
const _1 = require(".");
const ecc_1 = require("./util/ecc");
const public_key_1 = require("./public-key");
const transfer_1 = require("./transfer");
class FullTransfer {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('expected an object to deserialize a FullTransfer');
        }
        const inputs = hset_1.default.fromPOD(data.inputs, coin_1.default.fromPOD);
        if (inputs instanceof Error) {
            return inputs;
        }
        const bounties = hset_1.default.fromPOD(data.bounties, bounty_1.default.fromPOD);
        if (bounties instanceof Error) {
            return bounties;
        }
        const hookout = data.hookout ? _1.Hookout.fromPOD(data.hookout) : undefined;
        if (hookout instanceof Error) {
            return hookout;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new FullTransfer(inputs, bounties, hookout, authorization);
    }
    constructor(inputs, bounties, hookout, authorization) {
        this.inputs = inputs;
        this.bounties = bounties;
        this.hookout = hookout;
        this.authorization = authorization;
    }
    static hashOf(inputs, bounties, hookout) {
        const h = hash_1.default.newBuilder('Transfer');
        h.update(inputs.buffer);
        h.update(bounties.buffer);
        h.update(hookout ? hookout.buffer : new Uint8Array(32));
        return h.digest();
    }
    hash() {
        return transfer_1.default.hashOf(this.inputs.hash(), this.bounties.hash(), this.hookout ? this.hookout.hash() : undefined);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            bounties: this.bounties.toPOD(),
            hookout: this.hookout ? this.hookout.toPOD() : undefined,
            inputs: this.inputs.toPOD(),
        };
    }
    fee() {
        return this.inputs.amount - this.outputAmount();
    }
    outputAmount() {
        return this.bounties.amount + (this.hookout ? this.hookout.amount : 0);
    }
    isValid() {
        if (this.fee() < 0) {
            return false;
        }
        const p = ecc_1.muSig.pubkeyCombine(this.inputs.entries.map(coin => coin.owner));
        const pubkey = new public_key_1.default(p.x, p.y);
        return this.authorization.verify(this.hash().buffer, pubkey);
    }
    prune() {
        return new transfer_1.default(this.inputs, this.bounties.hash(), this.hookout ? this.hookout.hash() : undefined, this.authorization);
    }
}
exports.default = FullTransfer;
//# sourceMappingURL=full-transfer.js.map