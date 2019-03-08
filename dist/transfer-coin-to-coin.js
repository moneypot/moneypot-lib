"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimable_coin_set_1 = require("./claimable-coin-set");
const spent_coin_set_1 = require("./spent-coin-set");
const transfer_1 = require("./transfer");
// tc2c
class TransferCoinToCoin {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('TransferCoinToCoin was expecting an object');
        }
        const source = spent_coin_set_1.default.fromPOD(data.input);
        if (source instanceof Error) {
            return source;
        }
        const output = claimable_coin_set_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        return new TransferCoinToCoin(source, output);
    }
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    hash() {
        return transfer_1.default.hashOf(this.input.hash(), this.output.hash());
    }
    toPOD() {
        return {
            input: this.input.toPOD(),
            output: this.output.toPOD(),
        };
    }
}
exports.default = TransferCoinToCoin;
//# sourceMappingURL=transfer-coin-to-coin.js.map