import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as buffutils from '../util/buffutils';
import * as POD from '../pod';

export default class Failed extends AbstractStatus {
  reason: string;
  rebate: number;

  constructor(claimableHash: Hash, reason: string, rebate: number) {
    super(claimableHash);

    this.reason = reason;
    this.rebate = rebate;
  }

  hash() {
    return Hash.fromMessage(
      'Failed',
      this.buffer,
      buffutils.fromString(this.reason),
      buffutils.fromUint64(this.rebate)
    );
  }

  toPOD(): POD.Status.Failed {
    return {
      hash: this.hash().toPOD(),
      claimableHash: this.claimableHash.toPOD(),
      reason: this.reason,
    };
  }

  static fromPOD(obj: any): Failed | Error {
    if (typeof obj !== 'object') {
      return new Error('Failed.fromPOD expected an object');
    }

    const claimableHash = Hash.fromPOD(obj.claimableHash);
    if (claimableHash instanceof Error) {
      return claimableHash;
    }

    const reason = obj.reason;
    if (!(typeof reason !== 'string')) {
      return new Error('Failed.fromPOD expected a string reason');
    }
    const rebate = obj.rebate;
    if (!POD.isAmount(rebate)) {
      return new Error('rebate is not an amount');
    }

    return new Failed(claimableHash, reason, rebate);
  }
}
