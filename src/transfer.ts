import Hash from './hash';
import Signature from './signature';
import CoinSet from './coin-set';
import * as POD from './pod';

export default class Transfer {
  static fromPOD(data: any): Transfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a Transfer');
    }
    const input = CoinSet.fromPOD(data.input);
    if (input instanceof Error) {
      return input;
    }

    const output = Hash.fromBech(data.output);
    if (output instanceof Error) {
      return output;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new Transfer(input, output, authorization);
  }

  input: CoinSet;
  output: Hash;
  authorization: Signature;

  constructor(input: CoinSet, output: Hash, authorization: Signature) {
    this.input = input;
    this.output = output;
    this.authorization = authorization;
  }

  static hashOf(input: Hash, output: Hash) {
    const h = Hash.newBuilder('Transfer');

    h.update(input.buffer);
    h.update(output.buffer);

    return h.digest();
  }

  hash(): Hash {
    return Transfer.hashOf(this.input.hash(), this.output);
  }

  toPOD(): POD.Transfer {
    return {
      authorization: this.authorization.toBech(),
      input: this.input.toPOD(),
      output: this.output.toBech(),
    };
  }
}
