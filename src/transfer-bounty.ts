import Bounty from './bounty';
import ClaimedCoinSet from './claimed-coin-set';
import * as POD from './pod';
import Signature from './signature';
import Transfer from './transfer';

export default class TransferBounty {
  public static fromPOD(data: any): TransferBounty | Error {
    if (typeof data !== 'object') {
      return new Error('TransferBounty was expecting an object');
    }
    const source = ClaimedCoinSet.fromPOD(data.input);
    if (source instanceof Error) {
      return source;
    }
    const output = Bounty.fromPOD(data.output);
    if (output instanceof Error) {
      return output;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new TransferBounty(source, output, authorization);
  }

  public input: ClaimedCoinSet;
  public output: Bounty;

  public authorization: Signature;

  constructor(input: ClaimedCoinSet, output: Bounty, authorization: Signature) {
    this.input = input;
    this.output = output;
    this.authorization = authorization;
  }

  public hash() {
    return Transfer.hashOf(this.input.hash(), this.output.hash());
  }

  public toPOD(): POD.TransferBounty {
    return {
      authorization: this.authorization.toBech(),
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
