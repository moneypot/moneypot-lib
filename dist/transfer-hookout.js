"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
const transfer_1 = require("./transfer");
const coin_set_1 = require("./coin-set");
const hookout_1 = require("./hookout");
// c2h
class TransferHookout {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookin');
        }
        const input = coin_set_1.default.fromPOD(data.input);
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
        return new TransferHookout(input, output, authorization);
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
exports.default = TransferHookout;
//# sourceMappingURL=transfer-hookout.js.map