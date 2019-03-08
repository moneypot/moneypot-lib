"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
class Transfer {
    static fromPOD(d) {
        if (typeof d !== 'object') {
            return new Error('expected an object to deserialize a Transfer');
        }
        const input = hash_1.default.fromBech(d.input);
        if (input instanceof Error) {
            return input;
        }
        const output = hash_1.default.fromBech(d.output);
        if (output instanceof Error) {
            return output;
        }
        return new Transfer(input, output);
    }
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    static hashOf(input, output) {
        const h = hash_1.default.newBuilder('Transfer');
        h.update(input.buffer);
        h.update(output.buffer);
        return h.digest();
    }
    hash() {
        return Transfer.hashOf(this.input, this.output);
    }
    toPOD() {
        return {
            input: this.input.toBech(),
            output: this.output.toBech(),
        };
    }
}
exports.default = Transfer;
//# sourceMappingURL=transfer.js.map