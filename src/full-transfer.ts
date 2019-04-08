import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import HSet from './hset';
import Coin  from './coin';
import Bounty from './bounty';
import { Hookout } from '.';
import { muSig } from './util/ecc';
import PublicKey from './public-key'
import Transfer from './transfer';

export default class FullTransfer {

  static fromPOD(data: any): FullTransfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a FullTransfer');
    }

    const inputs = HSet.fromPOD<Coin, POD.Coin>(data.inputs, Coin.fromPOD);
    if (inputs instanceof Error) {
      return inputs;
    }

    const bounties = HSet.fromPOD<Bounty, POD.Bounty>(data.bounties, Bounty.fromPOD);
    if (bounties instanceof Error) {
      return bounties;
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

  inputs: HSet<Coin, POD.Coin>
  bounties: HSet<Bounty, POD.Bounty>;
  hookout: Hookout | undefined;

  authorization: Signature;

  constructor(inputs: HSet<Coin, POD.Coin>,
      bounties: HSet<Bounty, POD.Bounty>,
      hookout: Hookout | undefined,
      authorization: Signature) {

    this.inputs = inputs;
    this.bounties = bounties;
    this.hookout = hookout;
    this.authorization = authorization;
  }

  static hashOf(inputs: Hash, bounties: Hash, hookout: Hash | undefined) {
    const h = Hash.newBuilder('Transfer');

    h.update(inputs.buffer);
    h.update(bounties.buffer);
    h.update(hookout ? hookout.buffer : new Uint8Array(32));

    return h.digest();
  }

  hash(): Hash {
    return Transfer.hashOf(this.inputs.hash(), this.bounties.hash(), this.hookout ? this.hookout.hash() : undefined);
  }

  toPOD(): POD.FullTransfer {
    return {
      authorization: this.authorization.toBech(),
      bounties: this.bounties.toPOD(),
      hookout: this.hookout ? this.hookout.toPOD() : undefined,
      inputs: this.inputs.toPOD(),      
    };
  }

  fee(): number {
    return this.inputs.amount - this.outputAmount();
  }

  outputAmount(): number {
    return this.bounties.amount + (this.hookout ? this.hookout.amount : 0);
  }

  isValid(): boolean {
    if (this.fee() < 0) {
      return false;
    }

    const p = muSig.pubkeyCombine(this.inputs.entries.map(coin => coin.owner));
    const pubkey = new PublicKey(p.x, p.y);


    return this.authorization.verify(this.hash().buffer, pubkey);
  }

  prune(): Transfer {
    return new Transfer(this.inputs, this.bounties.hash(), this.hookout ? this.hookout.hash() : undefined, this.authorization);
  }
}
