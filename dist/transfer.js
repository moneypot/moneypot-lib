"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./util/assert");
const hash_1 = require("./hash");
const signature_1 = require("./signature");
const coin_1 = require("./coin");
const ecc_1 = require("./util/ecc");
const public_key_1 = require("./public-key");
const change_1 = require("./change");
const buffutils = require("./util/buffutils");
class Transfer {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('expected an object to deserialize a Transfer');
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
        const outputHash = hash_1.default.fromPOD(data.outputHash);
        if (outputHash instanceof Error) {
            return outputHash;
        }
        const change = change_1.default.fromPOD(data.change);
        if (change instanceof Error) {
            return change;
        }
        const authorization = signature_1.default.fromPOD(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new Transfer(inputs, outputHash, change, authorization);
    }
    constructor(inputs, outputHash, change, authorization) {
        assert_1.default(isHashSorted(inputs));
        this.inputs = inputs;
        this.outputHash = outputHash;
        this.change = change;
        this.authorization = authorization;
    }
    static sort(hashable) {
        hashable.sort((a, b) => buffutils.compare(a.hash().buffer, b.hash().buffer));
    }
    static sortHashes(hashes) {
        hashes.sort((a, b) => buffutils.compare(a.buffer, b.buffer));
    }
    static hashOf(inputs, output, change) {
        const h = hash_1.default.newBuilder('Transfer');
        for (const input of inputs) {
            h.update(input.buffer);
        }
        h.update(output.buffer);
        h.update(change.buffer);
        return h.digest();
    }
    hash() {
        return Transfer.hashOf(this.inputs.map(i => i.hash()), this.outputHash, this.change);
    }
    toPOD() {
        return {
            authorization: this.authorization.toPOD(),
            outputHash: this.outputHash.toPOD(),
            change: this.change.toPOD(),
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
        const p = ecc_1.muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
        const pubkey = new public_key_1.default(p.x, p.y);
        return this.authorization.verify(this.hash().buffer, pubkey);
    }
}
exports.default = Transfer;
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