import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as buffutils from '../util/buffutils';
import { POD } from '..';

export default class BitcoinTransactionSent extends AbstractStatus {
  txid: Uint8Array;
  vout: number;

  constructor(claimableHash: Uint8Array, txid: Uint8Array, vout: number) {
    super(claimableHash);
    this.txid = txid;
    this.vout = vout;
  }

  hash() {
    return Hash.fromMessage('BitcoinTransactionSent', this.buffer, this.txid, buffutils.fromUint32(this.vout));
  }

  toPOD(): POD.Status.BitcoinTransactionSent {
    return {
      claimableHash: buffutils.toHex(this.claimableHash),
      txid: buffutils.toHex(this.txid),
      vout: this.vout,
    };
  }

  static fromPOD(obj: any): BitcoinTransactionSent | Error {
    if (typeof obj !== 'object') {
      return new Error('BitcoinTransactionSent.fromPOD expected an object');
    }

    const claimableHash = buffutils.fromHex(obj.claimableHash, 32);
    if (claimableHash instanceof Error) {
      return claimableHash;
    }

    const txid = buffutils.fromHex(obj.txid, 32);
    if (txid instanceof Error) {
      return txid;
    }

    const vout = obj.vout;
    if (!Number.isSafeInteger(vout) || vout < 0 || vout > 65536) {
      return new Error('BitcoinTransactionSent.fromPOD requires a valid vout');
    }

    return new BitcoinTransactionSent(claimableHash, txid, vout);
  }
}
