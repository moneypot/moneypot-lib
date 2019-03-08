import ClaimableCoinSet from './claimable-coin-set';
import ClaimedCoinSet from './claimed-coin-set';
import * as POD from './pod';
import Signature from './signature';
import Transfer from './transfer'

// tc2c

export default class TransferCoinToCoin {
  public static fromPOD(data: any): TransferCoinToCoin | Error {
    if (typeof data !== 'object') {
      return new Error('TransferCoinToCoin was expecting an object');
    }
    const source = ClaimedCoinSet.fromPOD(data.input);
    if (source instanceof Error) {
      return source;
    }
    const output = ClaimableCoinSet.fromPOD(data.output);
    if (output instanceof Error) {
      return output;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new TransferCoinToCoin(source, output, authorization);
  }

  public input: ClaimedCoinSet;
  public output: ClaimableCoinSet;

  public authorization: Signature;


  constructor(input: ClaimedCoinSet, output: ClaimableCoinSet, authorization: Signature) {
    this.input = input;
    this.output = output;
    this.authorization = authorization;
  }

  public hash() {
    return Transfer.hashOf(this.input.hash(), this.output.hash());
  }

  public toPOD(): POD.TransferCoinToCoin {
    return {
      authorization: this.authorization.toBech(),
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
