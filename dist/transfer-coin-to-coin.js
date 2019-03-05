import ClaimableCoinSet from './claimable-coin-set';
import Hash from './hash';
import SpentCoinSet from './spent-coin-set';
// c2ct
export default class TransferCoinToCoin {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('TransferCoinToCoin was expecting an object');
        }
        const source = SpentCoinSet.fromPOD(data.input);
        if (source instanceof Error) {
            return source;
        }
        const output = ClaimableCoinSet.fromPOD(data.output);
        if (output instanceof Error) {
            return output;
        }
        return new TransferCoinToCoin(source, output);
    }
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    static hashOf(input, output) {
        const h = Hash.newBuilder('TransferCoinToCoin');
        h.update(input.buffer);
        h.update(output.buffer);
        return h.digest();
    }
    hash() {
        return TransferCoinToCoin.hashOf(this.input.hash(), this.output.hash());
    }
    toPOD() {
        return {
            input: this.input.toPOD(),
            output: this.output.toPOD(),
        };
    }
}
//# sourceMappingURL=transfer-coin-to-coin.js.map