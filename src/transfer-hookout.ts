import Signature from './signature';
import Transfer from './transfer';
import * as POD from './pod';
import CoinSet from './coin-set';
import Hookout from './hookout';

// c2h
export default class TransferHookout {
  public static fromPOD(data: any): TransferHookout | Error {
    if (!data || typeof data !== 'object') {
      return new Error('expected an obj to parse a TransferHookin');
    }

    const input = CoinSet.fromPOD(data.input);
    if (input instanceof Error) {
      return input;
    }

    const output = Hookout.fromPOD(data.output);
    if (output instanceof Error) {
      return output;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new TransferHookout(input, output, authorization);
  }

  public input: CoinSet;
  public output: Hookout;
  public authorization: Signature;

  constructor(input: CoinSet, output: Hookout, authorization: Signature) {
    this.input = input;
    this.output = output;
    this.authorization = authorization;
  }

  public prune(): Transfer {
    return new Transfer(this.input, this.output.hash(), this.authorization);
  }

  public hash() {
    return Transfer.hashOf(this.input.hash(), this.output.hash());
  }

  public toPOD(): POD.TransferHookout {
    return {
      authorization: this.authorization.toBech(),
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
