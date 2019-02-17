"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spent_coin_set_1 = require("./spent-coin-set");
const hookout_1 = require("./hookout");
const transfer_1 = require("./transfer");
// c2h
class TransferCoinToHookout {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookinToCoin');
        }
        const input = spent_coin_set_1.default.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = hookout_1.default.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        return new TransferCoinToHookout(input, output);
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
exports.default = TransferCoinToHookout;
//# sourceMappingURL=transfer-coin-to-hookout.js.map