import Hash from './hash';
export default class Transfer {
    static fromPOD(d) {
        if (typeof d !== 'object') {
            return new Error('expected an object to deserialize a Transfer');
        }
        const input = Hash.fromBech(d.input);
        if (input instanceof Error) {
            return input;
        }
        const output = Hash.fromBech(d.output);
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
        const h = Hash.newBuilder('Transfer');
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
//# sourceMappingURL=transfer.js.map