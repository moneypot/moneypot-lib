import ClaimableCoinSet from './claimable-coin-set';
import * as POD from './pod';
import SpentCoinSet from './spent-coin-set';
import Transfer from './transfer'

// tc2c

export default class TransferCoinToCoin {
  public static fromPOD(data: any): TransferCoinToCoin | Error {
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

  public input: SpentCoinSet;
  public output: ClaimableCoinSet;

  constructor(input: SpentCoinSet, output: ClaimableCoinSet) {
    this.input = input;
    this.output = output;
  }

  public hash() {
    return Transfer.hashOf(this.input.hash(), this.output.hash());
  }

  public toPOD(): POD.TransferCoinToCoin {
    return {
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
