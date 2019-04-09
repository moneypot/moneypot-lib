import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin  from './coin';
import Bounty from './bounty';
import { Hookout } from '.';
import { muSig } from './util/ecc';
import PublicKey from './public-key'
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
    

    const bounties: Bounty[] = [];
    for (const b of data.bounties) {
      const bounty = Bounty.fromPOD(b);
      if (bounty instanceof Error) {
        return bounty;
      }
      bounties.push(bounty);
    }

    const hookout = data.hookout ? Hookout.fromPOD(data.hookout) : undefined;
    if (hookout instanceof Error) {
      return hookout;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new FullTransfer(inputs, bounties, hookout, authorization);
  }

  readonly inputs: ReadonlyArray<Coin>
  readonly bounties: ReadonlyArray<Bounty>
  readonly hookout: Hookout | undefined;

  authorization: Signature;

  constructor(inputs:  ReadonlyArray<Coin>,
      bounties: ReadonlyArray<Bounty>,
      hookout: Hookout | undefined,
      authorization: Signature) {

    this.inputs = hashSort(inputs);
    this.bounties = hashSort(bounties);
    this.hookout = hookout;
    this.authorization = authorization;
  }


  hash(): Hash {
    return Transfer.hashOf(
        this.inputs.map(i =>i.hash()),
        this.bounties.map(b => b.hash()),
        this.hookout ? this.hookout.hash() : undefined
    );
  }

  toPOD(): POD.FullTransfer {
    return {
      authorization: this.authorization.toBech(),
      bounties: this.bounties.map(b => b.toPOD()),
      hookout: this.hookout ? this.hookout.toPOD() : undefined,
      inputs: this.inputs.map(b => b.toPOD()),      
    };
  }

  fee(): number {
    return this.inputAmount() - this.outputAmount();
  }

  inputAmount(): number {
    let amount = 0;
    for (const coin of this.inputs) {
      amount += coin.amount;
    }
    return amount;
  }

  outputAmount(): number {
    let amount = this.hookout ? this.hookout.amount : 0;
    for (const bounty of this.bounties) {
      amount += bounty.amount;
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
    return new Transfer(
      this.inputs,
      this.bounties.map(b => b.hash()), this.hookout ? this.hookout.hash() : undefined, this.authorization);
  }
}

function hashSort<T extends { hash(): Hash }>(ts: ReadonlyArray<T>) {
  return [...ts].sort((a: T, b: T) => buffutils.compare(a.hash().buffer, b.hash().buffer));
}