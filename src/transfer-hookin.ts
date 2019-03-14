import Bounty from './bounty';
import Transfer from './transfer';
import * as POD from './pod';
import Hookin from './hookin';
import Signature from './signature';

// th2c

export default class TransferHookin {
  public static fromPOD(data: any): TransferHookin | Error {
    if (!data || typeof data !== 'object') {
      return new Error('expected an obj to parse a TransferHookin');
    }

    const input = Hookin.fromPOD(data.input);
    if (input instanceof Error) {
      return input;
    }

    const output = Bounty.fromPOD(data.output);
    if (output instanceof Error) {
      return output;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }


    return new TransferHookin(input, output, authorization);
  }

  public input: Hookin;
  public output: Bounty;
  public authorization: Signature;

  constructor(input: Hookin, output: Bounty, authorization: Signature) {
    this.input = input;
    this.output = output;
    this.authorization = authorization;
  }

  public hash() {
    return Transfer.hashOf(this.input.hash(), this.output.hash());
  }


  public toPOD(): POD.TransferHookin {
    return {
      authorization: this.authorization.toBech(),
      input: this.input.toPOD(),
      output: this.output.toPOD(),
    };
  }
}
