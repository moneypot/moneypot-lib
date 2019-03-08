"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
const transfer_1 = require("./transfer");
const claimed_coin_set_1 = require("./claimed-coin-set");
const hookout_1 = require("./hookout");
// c2h
class TransferCoinToHookout {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookinToCoin');
        }
        const input = claimed_coin_set_1.default.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = hookout_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new TransferCoinToHookout(input, output, authorization);
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
exports.default = TransferCoinToHookout;
//# sourceMappingURL=transfer-coin-to-hookout.js.map