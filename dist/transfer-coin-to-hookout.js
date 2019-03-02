import Hash from './hash';
import SpentCoinSet from './spent-coin-set';
import Hookout from './hookout';
// c2h
export default class TransferCoinToHookout {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookinToCoin');
        }
        const input = SpentCoinSet.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = Hookout.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        return new TransferCoinToHookout(input, output);
    }
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    async hash() {
        const h = Hash.newBuilder('TransferCoinToHookout');
        h.update((await this.input.hash()).buffer);
        h.update((await this.output.hash()).buffer);
        return h.digest();
    }
    toPOD() {
        return {
            input: this.input.toPOD(),
            output: this.output.toPOD(),
        };
    }
}
//# sourceMappingURL=transfer-coin-to-hookout.js.map