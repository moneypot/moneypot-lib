import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as buffutils from '../util/buffutils';
import * as POD from '../pod';

export default class BitcoinTransactionSent extends AbstractStatus {
  txid: Uint8Array;

  constructor(claimableHash: Hash, txid: Uint8Array) {
    super(claimableHash);
    this.txid = txid;
  }

  hash() {
    return Hash.fromMessage('BitcoinTransactionSent', this.buffer, this.txid);
  }

  toPOD(): POD.Status.BitcoinTransactionSent {
    return {
      claimableHash: this.claimableHash.toPOD(),
      txid: buffutils.toHex(this.txid),
    };
  }

  static fromPOD(obj: any): BitcoinTransactionSent | Error {
    if (typeof obj !== 'object') {
      return new Error('BitcoinTransactionSent.fromPOD expected an object');
    }

    const claimableHash = Hash.fromPOD(obj.claimableHash);
    if (claimableHash instanceof Error) {
      return claimableHash;
    }

    const txid = buffutils.fromHex(obj.txid, 32);
    if (txid instanceof Error) {
      return txid;
    }

    return new BitcoinTransactionSent(claimableHash, txid);
  }
}
