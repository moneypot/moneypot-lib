import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';

import SHA512 from './util/bcrypto/sha512';

import * as POD from './pod';

import * as buffutils from './util/buffutils';

import Params from './params';

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

    const claimant = PublicKey.fromBech(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    const deriveIndex = data.deriveIndex;

    return new Hookin(txid, vout, amount, claimant, deriveIndex);
  }

  public static hashOf(txid: Uint8Array, vout: number, amount: number, claimant: PublicKey, deriveIndex: number) {
    const b = Hash.newBuilder('Hookin');
    b.update(txid);
    b.update(buffutils.fromUint32(vout));
    b.update(buffutils.fromUint64(amount));
    b.update(claimant.buffer);
    b.update(buffutils.fromUint32(deriveIndex));
    return b.digest();
  }

  public txid: Uint8Array;
  public vout: number;
  public amount: number;
  public claimant: PublicKey;
  public deriveIndex: number;

  constructor(txid: Uint8Array, vout: number, amount: number, claimant: PublicKey, deriveIndex: number) {
    this.txid = txid;
    this.vout = vout;
    this.amount = amount;
    this.claimant = claimant;
    this.deriveIndex = deriveIndex;
  }

  public hash(): Hash {
    return Hookin.hashOf(this.txid, this.vout, this.amount, this.claimant, this.deriveIndex);
  }

  getTweak(): PrivateKey {
    const message = buffutils.concat(Params.fundingPublicKey.buffer, buffutils.fromUint32(this.deriveIndex));

    const I = SHA512.mac(this.claimant.hash().buffer, message);
    const IL = I.slice(0, 32);
    const pk = PrivateKey.fromBytes(IL);
    if (pk instanceof Error) {
      throw pk;
    }

    return pk;
  }

  public toPOD(): POD.Hookin {
    return {
      amount: this.amount,
      claimant: this.claimant.toBech(),
      deriveIndex: this.deriveIndex,
      txid: buffutils.toHex(this.txid),
      vout: this.vout,
    };
  }
}
