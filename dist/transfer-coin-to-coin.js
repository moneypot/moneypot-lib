import ClaimableCoinSet from './claimable-coin-set';
import SpentCoinSet from './spent-coin-set';
import Transfer from './transfer';
// tc2c
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
    hash() {
        return Transfer.hashOf(this.input.hash(), this.output.hash());
    }
    toPOD() {
        return {
            input: this.input.toPOD(),
            output: this.output.toPOD(),
        };
    }
}
//# sourceMappingURL=transfer-coin-to-coin.js.map