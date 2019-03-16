import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';

export default class Transfer {
  static fromPOD(data: any): Transfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a Transfer');
    }
    const input = Hash.fromBech(data.input);
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

  input: Hash;
  output: Hash;
  authorization: Signature;

  constructor(input: Hash, output: Hash, authorization: Signature) {
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
    return Transfer.hashOf(this.input, this.output);
  }

  toPOD(): POD.Transfer {
    return {
      authorization: this.authorization.toBech(),
      input: this.input.toBech(),
      output: this.output.toBech(),
    };
  }
}
