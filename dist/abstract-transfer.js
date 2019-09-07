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
class AbstractTransfer {
    constructor({ amount, authorization, fee, inputs }) {
        this.amount = amount;
        this.authorization = authorization;
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
    static transferHash(td) {
        return hash_1.default.fromMessage('Transfer', buffutils.fromUint64(td.amount), buffutils.fromUint64(td.fee), buffutils.fromUint64(td.inputs.length), ...td.inputs.map(i => i.buffer));
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            amount: this.amount,
            authorization: this.authorization ? this.authorization.toPOD() : null,
            claimant: this.claimant.toPOD(),
            fee: this.fee,
            inputs: this.inputs.map(i => i.toPOD()),
        };
    }
    get claimableAmount() {
        return this.amount - this.fee;
    }
    inputAmount() {
        let amount = 0;
        for (const coin of this.inputs) {
            amount += coin.amount;
        }
        return amount;
    }
    get claimant() {
        const p = ecc_1.muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
        return new public_key_1.default(p.x, p.y);
    }
    isAuthorized() {
        if (!this.authorization) {
            return false;
        }
        const msg = hash_1.default.fromMessage('authorization', this.hash().buffer).buffer;
        return this.authorization.verify(msg, this.claimant);
    }
    authorize(inputPrivateKeys) {
        this.authorization = signature_1.default.computeMu(hash_1.default.fromMessage('authorization', this.hash().buffer).buffer, inputPrivateKeys);
    }
}
exports.default = AbstractTransfer;
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
    const fee = data.fee;
    if (!POD.isAmount(fee)) {
        return new Error('Transfer.fromPOD invalid fee');
    }
    let inputAmount = 0;
    const inputs = [];
    for (const i of data.inputs) {
        const input = coin_1.default.fromPOD(i);
        if (input instanceof Error) {
            return input;
        }
        inputAmount += input.amount;
        inputs.push(input);
    }
    if (!isHashSorted(inputs)) {
        return new Error('inputs are not in sorted order');
    }
    if (inputAmount < amount + fee) {
        return new Error('not sourcing enough input for amount and fee');
    }
    return { amount, authorization, fee, inputs };
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
//# sourceMappingURL=abstract-transfer.js.map