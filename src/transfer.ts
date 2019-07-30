import assert from './util/assert';
import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import { muSig } from './util/ecc';
import PublicKey from './public-key';
import * as buffutils from './util/buffutils';

export default class Transfer {
  static fromPOD(data: any): Transfer | Error {
    if (typeof data !== 'object') {
      return new Error('expected an object to deserialize a Transfer');
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

    const outputHash = Hash.fromPOD(data.outputHash);
    if (outputHash instanceof Error) {
      return outputHash;
    }

    const changeClaimant = PublicKey.fromPOD(data.changeClaimant);
    if (changeClaimant instanceof Error) {
      return changeClaimant;
    }

    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new Transfer(inputs, outputHash, changeClaimant, authorization);
  }

  readonly inputs: ReadonlyArray<Coin>;
  readonly outputHash: Hash;
  readonly changeClaimant: PublicKey;

  authorization: Signature;

  constructor(inputs: ReadonlyArray<Coin>, outputHash: Hash, changeClaimant: PublicKey, authorization: Signature) {
    assert(isHashSorted(inputs));
    this.inputs = inputs;

    this.outputHash = outputHash;
    this.changeClaimant = changeClaimant;

    this.authorization = authorization;
  }

  public static sort(hashable: { hash(): Hash }[]) {
    hashable.sort((a, b) => buffutils.compare(a.hash().buffer, b.hash().buffer));
  }

  public static sortHashes(hashes: Hash[]) {
    hashes.sort((a: Hash, b: Hash) => buffutils.compare(a.buffer, b.buffer));
  }

  static hashOf(inputs: ReadonlyArray<Hash>, output: Hash, changeClaimant: PublicKey) {
    const h = Hash.newBuilder('Transfer');

    for (const input of inputs) {
      h.update(input.buffer);
    }
    h.update(output.buffer);
    h.update(changeClaimant.buffer);

    return h.digest();
  }

  hash(): Hash {
    return Transfer.hashOf(this.inputs.map(i => i.hash()), this.outputHash, this.changeClaimant);
  }

  toPOD(): POD.Transfer {
    return {
      authorization: this.authorization.toPOD(),
      outputHash: this.outputHash.toPOD(),
      changeClaimant: this.changeClaimant.toPOD(),
      inputs: this.inputs.map(i => i.toPOD()),
    };
  }

  inputAmount(): number {
    let amount = 0;
    for (const coin of this.inputs) {
      amount += coin.amount;
    }
    return amount;
  }

  isAuthorized(): boolean {
    const p = muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
    const pubkey = new PublicKey(p.x, p.y);

    return this.authorization.verify(this.hash().buffer, pubkey);
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

function isSorted<T extends { buffer: Uint8Array }>(ts: ReadonlyArray<T>) {
  for (let i = 1; i < ts.length; i++) {
    const c = buffutils.compare(ts[i - 1].buffer, ts[i].buffer);
    if (c > 0) {
      return false;
    }
  }

  return true;
}

// TODO: these sort can be optimized to check if it's already sorted, if so, just return original
function hashSort<T extends { hash(): Hash }>(ts: ReadonlyArray<T>) {
  return [...ts].sort((a: T, b: T) => buffutils.compare(a.hash().buffer, b.hash().buffer));
}

function sort<T extends { buffer: Uint8Array }>(ts: ReadonlyArray<T>) {
  return [...ts].sort((a: T, b: T) => buffutils.compare(a.buffer, b.buffer));
}
