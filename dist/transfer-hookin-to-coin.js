import ClaimableCoinSet from './claimable-coin-set';
import Hash from './hash';
import SpentHookin from './spent-hookin';
// th2c
export default class TransferHookinToCoin {
    static fromPOD(data) {
        if (!data || typeof data !== 'object') {
            return new Error('expected an obj to parse a TransferHookinToCoin');
        }
        const input = SpentHookin.fromPOD(data.input);
        if (input instanceof Error) {
            return input;
        }
        const output = ClaimableCoinSet.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        return new TransferHookinToCoin(input, output);
    }
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    async hash() {
        const h = Hash.newBuilder('TransferHookinToCoin');
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
//# sourceMappingURL=transfer-hookin-to-coin.js.map