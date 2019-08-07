import assert from './util/assert';
import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import { muSig } from './util/ecc';
import PublicKey from './public-key';
import * as buffutils from './util/buffutils';

export default abstract class Abstract {
  amount: number;
  inputs: Coin[];
  claimant: PublicKey;
  fee: number;

  authorization?: Signature;

  abstract kind: 'LightningPayment' | 'FeeBump' | 'Hookout';

  constructor({ amount, authorization, claimant, fee, inputs }: TransferData) {
    this.amount = amount;
    this.authorization = authorization;
    this.claimant = claimant;
    this.fee = fee;

    assert(isHashSorted(inputs));
    this.inputs = inputs;
  }

  public static sort(hashable: { hash(): Hash }[]) {
    hashable.sort((a, b) => buffutils.compare(a.hash().buffer, b.hash().buffer));
  }

  public static sortHashes(hashes: Hash[]) {
    hashes.sort((a: Hash, b: Hash) => buffutils.compare(a.buffer, b.buffer));
  }

  // doesn't include authorization, used for hashing
  public transferHash(): Hash {
    return Hash.fromMessage(
      'Transfer',
      buffutils.fromUint64(this.amount),
      this.claimant.buffer,
      buffutils.fromUint64(this.fee),
      buffutils.fromUint64(this.inputs.length),
      ...this.inputs.map(i => i.buffer)
    );
  }

  abstract hash(): Hash;

  toPOD(): POD.AbstractTransfer {
    return {
      amount: this.amount,
      authorization: this.authorization ? this.authorization.toPOD() : null,
      claimant: this.claimant.toPOD(),
      fee: this.fee,
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
    if (!this.authorization) {
      return false;
    }
    const p = muSig.pubkeyCombine(this.inputs.map(coin => coin.owner));
    const pubkey = new PublicKey(p.x, p.y);

    return this.authorization.verify(this.hash().buffer, pubkey);
  }
}

export function parseTransferData(data: any): TransferData | Error {
  if (typeof data !== 'object') {
    return new Error('expected an object to deserialize a Transfer');
  }

  const amount = data.amount;
  if (!POD.isAmount(amount)) {
    return new Error('Transfer.fromPOD invalid amount');
  }

  const authorization = data.authorization !== null ? Signature.fromPOD(data.authorization) : undefined;
  if (authorization instanceof Error) {
    return authorization;
  }

  const claimant = PublicKey.fromPOD(data.claimant);
  if (claimant instanceof Error) {
    return claimant;
  }

  const fee = data.fee;
  if (!POD.isAmount(fee)) {
    return new Error('Transfer.fromPOD invalid fee');
  }

  let inputAmount = 0;
  const inputs: Coin[] = [];
  for (const i of data.inputs) {
    const input = Coin.fromPOD(i);
    if (input instanceof Error) {
      return input;
    }
    inputAmount += input.amount;
    inputs.push(input);
  }
  if (!isHashSorted(inputs)) {
    return new Error('inputs are not in sorted order');
  }

  if (inputAmount < amount + fee) {
    return new Error('not sourcing enough input for amount and fee');
  }

  return { amount, authorization, claimant, fee, inputs };
}

export interface TransferData {
  amount: number;
  authorization?: Signature;
  claimant: PublicKey;
  fee: number;
  inputs: Coin[];
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
