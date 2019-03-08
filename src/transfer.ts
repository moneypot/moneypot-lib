import Hash from './hash';
import * as POD from './pod';

export default class Transfer {

  static fromPOD(d: any): Transfer | Error {
    if (typeof d !== 'object') {
      return new Error('expected an object to deserialize a Transfer');
    }
    const input = Hash.fromBech(d.input);
    if (input instanceof Error) {
      return input;
    }

    const output = Hash.fromBech(d.output);
    if (output instanceof Error) {
      return output;
    }

    return new Transfer(input, output);
  }

  input: Hash;
  output: Hash;

  constructor(input: Hash, output: Hash) {
    this.input = input;
    this.output = output;
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
      input: this.input.toBech(),
      output: this.output.toBech(),
    }
  }




}
