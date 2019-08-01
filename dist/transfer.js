"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./util/assert");
const hash_1 = require("./hash");
const signature_1 = require("./signature");
const POD = require("./pod");
const coin_1 = require("./coin");
const ecc_1 = require("./util/ecc");
const public_key_1 = require("./public-key");
const buffutils = require("./util/buffutils");
class Transfer {
    constructor({ amount, authorization, claimant, fee, inputs }) {
        this.amount = amount;
        this.authorization = authorization;
        this.claimant = claimant;
        this.fee = fee;
        assert_1.default(isHashSorted(inputs));
        this.inputs = inputs;
    }
    static sort(hashable) {
        hashable.sort((a, b) => buffutils.compare(a.hash().buffer, b.hash().buffer));
    }
    static sortHashes(hashes) {
        hashes.sort((a, b) => buffutils.compare(a.buffer, b.buffer));
    }
    // doesn't include authorization, used for hashing
    transferHash() {
        return hash_1.default.fromMessage('Transfer', buffutils.fromUint64(this.amount), this.claimant.buffer, buffutils.fromUint64(this.fee), buffutils.fromUint64(this.inputs.length), ...this.inputs.map(i => i.buffer));
    }
    toPOD() {
        return {
            amount: this.amount,
            authorization: this.authorization ? this.authorization.toPOD() : null,
            claimant: this.claimant.toPOD(),
            fee: this.fee,
            inputs: this.inputs.map(i => i.toPOD()),
        };
    }
    inputAmount() {
        let amount = 0;
        for (const coin of this.inputs) {
            amount += coin.amount;
        }
        return amount;
    }
    isAuthorized() {
        if (!this.authorization) {
            return false;
        }
        const p = ecc_1.muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
        const pubkey = new public_key_1.default(p.x, p.y);
        return this.authorization.verify(this.hash().buffer, pubkey);
    }
}
exports.default = Transfer;
function parseTransferData(data) {
    if (typeof data !== 'object') {
        return new Error('expected an object to deserialize a Transfer');
    }
    const amount = data.amount;
    if (!POD.isAmount(amount)) {
        return new Error('Transfer.fromPOD invalid amount');
    }
    const authorization = data.authorization !== null ? signature_1.default.fromPOD(data.authorization) : undefined;
    if (authorization instanceof Error) {
        return authorization;
    }
    const claimant = public_key_1.default.fromPOD(data.claimant);
    if (claimant instanceof Error) {
        return claimant;
    }
    const fee = data.fee;
    if (!POD.isAmount(fee)) {
        return new Error('Transfer.fromPOD invalid fee');
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
    return { amount, authorization, claimant, fee, inputs };
}
exports.parseTransferData = parseTransferData;
function isHashSorted(ts) {
    for (let i = 1; i < ts.length; i++) {
        const c = buffutils.compare(ts[i - 1].hash().buffer, ts[i].hash().buffer);
        if (c > 0) {
            return false;
        }
    }
    return true;
}
function isSorted(ts) {
    for (let i = 1; i < ts.length; i++) {
        const c = buffutils.compare(ts[i - 1].buffer, ts[i].buffer);
        if (c > 0) {
            return false;
        }
    }
    return true;
}
// TODO: these sort can be optimized to check if it's already sorted, if so, just return original
function hashSort(ts) {
    return [...ts].sort((a, b) => buffutils.compare(a.hash().buffer, b.hash().buffer));
}
function sort(ts) {
    return [...ts].sort((a, b) => buffutils.compare(a.buffer, b.buffer));
}
//# sourceMappingURL=transfer.js.map