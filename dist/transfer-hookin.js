"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bounty_1 = require("./bounty");
const transfer_1 = require("./transfer");
const hookin_1 = require("./hookin");
const signature_1 = require("./signature");
// th2c
class TransferHookin {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookin');
        }
        const input = hookin_1.default.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = bounty_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new TransferHookin(input, output, authorization);
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
exports.default = TransferHookin;
//# sourceMappingURL=transfer-hookin.js.map