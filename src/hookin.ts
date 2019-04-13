import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';

import * as POD from './pod';

import * as buffutils from './util/buffutils';

export default class Hookin {
  public static fromPOD(data: any): Hookin | Error {
    if (typeof data !== 'object') {
      return new Error('hookin expected an object');
    }

    const txid = buffutils.fromHex(data.txid, 32);
    if (txid instanceof Error) {
      return txid;
    }

    const vout = data.vout;
    if (!Number.isSafeInteger(vout) || vout < 0 || vout > 65536) {
      return new Error('hookin was given an invalid vout');
    }
    const amount = data.amount;
    if (!POD.isAmount(amount)) {
      return new Error('invalid amount for hookin');
    }

    const claimant = PublicKey.fromPOD(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    return new Hookin(txid, vout, amount, claimant);
  }

  public static hashOf(txid: Uint8Array, vout: number, amount: number, claimant: PublicKey) {
    const b = Hash.newBuilder('Hookin');
    b.update(txid);
    b.update(buffutils.fromUint32(vout));
    b.update(buffutils.fromUint64(amount));
    b.update(claimant.buffer);
    return b.digest();
  }

  public txid: Uint8Array;
  public vout: number;
  public amount: number;
  public claimant: PublicKey;

  constructor(txid: Uint8Array, vout: number, amount: number, claimant: PublicKey) {
    this.txid = txid;
    this.vout = vout;
    this.amount = amount;
    this.claimant = claimant;
  }

  public hash(): Hash {
    return Hookin.hashOf(this.txid, this.vout, this.amount, this.claimant);
  }

  getTweak(): PrivateKey {
    const bytes = Hash.fromMessage('tweak', this.claimant.buffer).buffer;
    const pk = PrivateKey.fromBytes(bytes);
    if (pk instanceof Error) {
      throw pk;
    }

    return pk;
  }

  public toPOD(): POD.Hookin {
    return {
      amount: this.amount,
      claimant: this.claimant.toPOD(),
      txid: buffutils.toHex(this.txid),
      vout: this.vout,
    };
  }
}
