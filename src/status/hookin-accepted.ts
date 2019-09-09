import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
import * as buffutils from '../util/buffutils';

export default class HookinAccepted extends AbstractStatus {
  consolidationFee: number;

  constructor(claimableHash: Hash, consolidationFee: number) {
    super(claimableHash);
    this.consolidationFee = consolidationFee;
  }

  public hash() {
    const h = Hash.newBuilder('HookinAccepted');
    h.update(this.claimableHash.buffer);
    h.update(buffutils.fromUint64(this.consolidationFee));
    return h.digest();
  }

  public toPOD(): POD.Status.HookinAccepted {
    return {
      hash: this.hash().toPOD(),
      claimableHash: this.claimableHash.toPOD(),
      consolidationFee: this.consolidationFee,
    };
  }

  public static fromPOD(data: any): HookinAccepted | Error {
    if (typeof data !== 'object') {
      throw new Error('HookinAccepted.fromPOD must take an object');
    }

    const claimableHash = Hash.fromPOD(data.claimableHash);
    if (claimableHash instanceof Error) {
      return claimableHash;
    }

    const consolidationFee = data.consolidationFee;
    if (!POD.isAmount(consolidationFee)) {
      throw new Error('HookinAccepted.fromPOD expected an amount consolidation fee');
    }

    return new HookinAccepted(claimableHash, consolidationFee);
  }
}
