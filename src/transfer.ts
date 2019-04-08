import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import HSet from './hset';
import Coin  from './coin';
import { muSig } from './util/ecc';
import PublicKey from './public-key'

export default class Transfer {

  static fromPOD(data: any): Transfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a Transfer');
    }

    const inputs = HSet.fromPOD<Coin, POD.Coin>(data.inputs, Coin.fromPOD);
    if (inputs instanceof Error) {
      return inputs;
    }

    const bountiesHash = Hash.fromBech(data.bountiesHash);
    if (bountiesHash instanceof Error) {
      return bountiesHash;
    }

    const hookoutHash = data.hookout ?  Hash.fromBech(data.hookoutHash) : undefined;
    if (hookoutHash instanceof Error) {
      return hookoutHash;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new Transfer(inputs, bountiesHash, hookoutHash, authorization);
  }

  inputs: HSet<Coin, POD.Coin>
  bountiesHash: Hash;
  hookoutHash: Hash | undefined;

  authorization: Signature;

  constructor(inputs: HSet<Coin, POD.Coin>,
      bountiesHash: Hash,
      hookoutHash: Hash | undefined,
      authorization: Signature) {

    this.inputs = inputs;
    this.bountiesHash = bountiesHash;
    this.hookoutHash = hookoutHash;
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
    return Transfer.hashOf(this.inputs.hash(), this.bountiesHash, this.hookoutHash ? this.hookoutHash : undefined);
  }

  toPOD(): POD.Transfer {
    return {
      authorization: this.authorization.toBech(),
      bountiesHash: this.bountiesHash.toBech(),
      hookoutHash: this.hookoutHash ? this.hookoutHash.toBech() : undefined,
      inputs: this.inputs.toPOD(),      
    };
  }

  isValid(): boolean {
    const p = muSig.pubkeyCombine(this.inputs.entries.map(coin => coin.owner));
    const pubkey = new PublicKey(p.x, p.y);

    return this.authorization.verify(this.hash().buffer, pubkey);
  }
}
