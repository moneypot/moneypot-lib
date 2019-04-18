import assert from './util/assert';
import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import Bounty from './bounty';
import { Hookout } from '.';
import { muSig } from './util/ecc';
import PublicKey from './public-key';
import Transfer from './transfer';
import * as buffutils from './util/buffutils';

export default class FullTransfer {
  static fromPOD(data: any): FullTransfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a FullTransfer');
    }

    if (!Array.isArray(data.inputs)) {
      return new Error('expected an array for input in FullTransfer');
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

    let output;

    if (typeof data.output !== 'object') {
      return new Error('expected object for data in FullTransfer');
    }
    if (data.output.kind === 'Bounty') {
      output = Bounty.fromPOD(data.output);
      if (output instanceof Error) {
        return output;
      }
    } else if (data.output.kind === 'Hookout') {
      output = Hookout.fromPOD(data.output);
      if (output instanceof Error) {
        return output;
      }
    } else {
      return new Error('unexpected output kind');
    }

    const change = Bounty.fromPOD(data.change);
    if (change instanceof Error) {
      return change;
    }

    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new FullTransfer(inputs, output, change, authorization);
  }

  readonly inputs: ReadonlyArray<Coin>;
  readonly output: Hookout | Bounty;
  readonly change: Bounty;

  authorization: Signature;

  constructor(inputs: ReadonlyArray<Coin>, output: Hookout | Bounty, change: Bounty, authorization: Signature) {
    assert(isHashSorted(inputs));
    this.inputs = inputs;

    this.change = change;

    this.output = output;
    this.authorization = authorization;
  }

  hash(): Hash {
    return Transfer.hashOf(this.inputs.map(i => i.hash()), this.output.hash(), this.change.hash());
  }

  toPOD(): POD.FullTransfer {
    let output: POD.KindedBounty | POD.KindedHookout;
    if (this.output instanceof Bounty) {
      output = { kind: 'Bounty', ...this.output.toPOD() };
    } else if (this.output instanceof Hookout) {
      output = { kind: 'Hookout', ...this.output.toPOD() };
    } else {
      const _impossible: never = this.output;
      throw new Error('unreachable!');
    }

    return {
      inputs: this.inputs.map(b => b.toPOD()),
      output,
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
    return new Transfer(this.inputs, this.output.hash(), this.change.hash(), this.authorization);
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
