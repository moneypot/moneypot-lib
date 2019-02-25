"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const claimable_coin_set_1 = require("./claimable-coin-set");
const hash_1 = require("./hash");
const spent_coin_set_1 = require("./spent-coin-set");
// c2ct
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
        const h = hash_1.default.newBuilder('TransferCoinToCoin');
        h.update(this.input.hash().buffer);
        h.update(this.output.hash().buffer);
        return h.digest();
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