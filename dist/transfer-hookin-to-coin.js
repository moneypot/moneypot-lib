"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimable_coins_1 = require("./claimable-coins");
const transfer_1 = require("./transfer");
const hookin_1 = require("./hookin");
const signature_1 = require("./signature");
// th2c
class TransferHookinToCoin {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookinToCoin');
        }
        const input = hookin_1.default.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = claimable_coins_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new TransferHookinToCoin(input, output, authorization);
    }
    constructor(input, output, authorization) {
        this.input = input;
        this.output = output;
        this.authorization = authorization;
    }
    hash() {
        return transfer_1.default.hashOf(this.input.hash(), this.output.hash());
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            input: this.input.toPOD(),
            output: this.output.toPOD(),
        };
    }
}
exports.default = TransferHookinToCoin;
//# sourceMappingURL=transfer-hookin-to-coin.js.map