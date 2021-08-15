"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("./util/assert"));
const hash_1 = __importDefault(require("./hash"));
const signature_1 = __importDefault(require("./signature"));
const POD = __importStar(require("./pod"));
const coin_1 = __importDefault(require("./coin"));
const public_key_1 = __importDefault(require("./public-key"));
const buffutils = __importStar(require("./util/buffutils"));
class AbstractTransfer {
    constructor({ amount, authorization, fee, inputs, initCreated }) {
        this.amount = amount;
        this.authorization = authorization;
        this.fee = fee;
        this.initCreated = initCreated;
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
            initCreated: this.initCreated,
        };
    }
    get claimableAmount() {
        return this.inputAmount() - this.amount - this.fee;
    }
    inputAmount() {
        let amount = 0;
        for (const coin of this.inputs) {
            amount += coin.amount;
        }
        return amount;
    }
    get claimant() {
        return public_key_1.default.combine(this.inputs.map(coin => coin.owner));
    }
    isAuthorized() {
        if (!this.authorization) {
            return false;
        }
        const msg = hash_1.default.fromMessage('authorization', this.hash().buffer).buffer;
        return this.authorization.verify(msg, this.claimant);
    }
    authorize(combinedInputPrivkey) {
        this.authorization = signature_1.default.compute(hash_1.default.fromMessage('authorization', this.hash().buffer).buffer, combinedInputPrivkey);
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
    const initCreated = data.initCreated;
    if (initCreated) {
        if (typeof initCreated != 'number') {
            throw initCreated;
        }
    }
    return { amount, authorization, fee, inputs, initCreated };
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