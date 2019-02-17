"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimable_coin_set_1 = require("./claimable-coin-set");
const spent_hookin_1 = require("./spent-hookin");
const transfer_1 = require("./transfer");
// th2c
class TransferHookinToCoin {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookinToCoin');
        }
        const input = spent_hookin_1.default.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = claimable_coin_set_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        return new TransferHookinToCoin(input, output);
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
exports.default = TransferHookinToCoin;
//# sourceMappingURL=transfer-hookin-to-coin.js.map