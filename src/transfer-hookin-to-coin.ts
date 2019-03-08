import ClaimableCoinSet from './claimable-coin-set';
import Transfer from './transfer';
import * as POD from './pod';
import SpentHookin from './spent-hookin';

// th2c

export default class TransferHookinToCoin {
  public static fromPOD(data: any): TransferHookinToCoin | Error {
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

  public input: SpentHookin;
  public output: ClaimableCoinSet;

  constructor(input: SpentHookin, output: ClaimableCoinSet) {
    this.input = input;
    this.output = output;
  }

  public hash() {
    return Transfer.hashOf(this.input.hash(), this.output.hash());
  }


  public toPOD(): POD.TransferHookinToCoin {
    return {
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
