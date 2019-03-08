"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimable_coin_set_1 = require("./claimable-coin-set");
const claimed_coin_set_1 = require("./claimed-coin-set");
const signature_1 = require("./signature");
const transfer_1 = require("./transfer");
// tc2c
class TransferCoinToCoin {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('TransferCoinToCoin was expecting an object');
        }
        const source = claimed_coin_set_1.default.fromPOD(data.input);
        if (source instanceof Error) {
            return source;
        }
        const output = claimable_coin_set_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        const authorization = signature_1.default.fromBech(data.authorization);
        if (authorization instanceof Error) {
            return authorization;
        }
        return new TransferCoinToCoin(source, output, authorization);
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
exports.default = TransferCoinToCoin;
//# sourceMappingURL=transfer-coin-to-coin.js.map