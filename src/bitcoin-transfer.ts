import assert from './util/assert';
import Hash from './hash';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import { Hookout } from '.';
import { muSig } from './util/ecc';
import Change from './change';
import Transfer from './transfer';
import * as buffutils from './util/buffutils';

export default class BitcoinTransfer {
  static fromPOD(data: any): BitcoinTransfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a BitcoinTransfer');
    }

    if (!Array.isArray(data.inputs)) {
      return new Error('expected an array for input in BitcoinTransfer');
    }

    const inputs: Coin[] = [];
    for (const i of data.inputs) {
      const input = Coin.fromPOD(i);
      if (input instanceof Error) {
        return input;
      }
      inputs.push(input);
    }
    if (!isHashSorted(inputs)) {
      return new Error('inputs are not in sorted order');
    }

    if (typeof data.output !== 'object') {
      return new Error('expected object for data in BitcoinTransfer');
    }

    const output = Hookout.fromPOD(data.output);
    if (output instanceof Error) {
      return output;
    }

    const change = Change.fromPOD(data.change);
    if (change instanceof Error) {
      return change;
    }

    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new BitcoinTransfer(inputs, output, change, authorization);
  }

  readonly inputs: ReadonlyArray<Coin>;
  readonly output: Hookout;
  readonly change: Change;

  authorization: Signature;

  constructor(inputs: ReadonlyArray<Coin>, output: Hookout, change: Change, authorization: Signature) {
    assert(isHashSorted(inputs));
    this.inputs = inputs;

    this.change = change;

    this.output = output;
    this.authorization = authorization;
  }

  hash(): Hash {
    return Transfer.hashOf(this.inputs.map(i => i.hash()), this.output.hash(), this.change);
  }

  toPOD(): POD.BitcoinTransfer {
    return {
      inputs: this.inputs.map(b => b.toPOD()),
      output: this.output.toPOD(),
      change: this.change.toPOD(),
      authorization: this.authorization.toPOD(),
    };
  }

  fee(): number {
    return this.inputAmount() - (this.output.amount + this.change.amount);
  }

  inputAmount(): number {
    let amount = 0;
    for (const coin of this.inputs) {
      amount += coin.amount;
    }
    return amount;
  }

  isValid(): boolean {
    if (this.fee() < 0) {
      return false;
    }

    const p = muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
    const pubkey = new PublicKey(p.x, p.y);

    return this.authorization.verify(this.hash().buffer, pubkey);
  }

  prune(): Transfer {
    return new Transfer(this.inputs, this.output.hash(), this.change, this.authorization);
  }
}

function isHashSorted<T extends { hash(): Hash }>(ts: ReadonlyArray<T>) {
  for (let i = 1; i < ts.length; i++) {
    const c = buffutils.compare(ts[i - 1].hash().buffer, ts[i].hash().buffer);
    if (c > 0) {
      return false;
    }
  }

  return true;
}
