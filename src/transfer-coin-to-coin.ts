import ClaimableCoinSet from './claimable-coin-set';
import Hash from './hash';
import * as POD from './pod';
import SpentCoinSet from './spent-coin-set';

// c2ct

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
    const h = Hash.newBuilder('TransferCoinToCoin');

    h.update((this.input.hash()).buffer);
    h.update((this.output.hash()).buffer);

    return h.digest();
  }

  public toPOD(): POD.TransferCoinToCoin {
    return {
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
