import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
import * as buffutils from '../util/buffutils';

export default class HookinAccepted extends AbstractStatus {
  consolidationFee: number;
  adversaryFee?: number;

  constructor(claimableHash: Hash, consolidationFee: number, adversaryFee?: number) {
    super(claimableHash);
    this.consolidationFee = consolidationFee;
    this.adversaryFee = adversaryFee;
  }

  public hash() {
    const h = Hash.newBuilder('HookinAccepted');
    h.update(this.claimableHash.buffer);
    h.update(buffutils.fromUint64(this.consolidationFee));
    (this.adversaryFee && h.update(buffutils.fromUint64(this.adversaryFee)))
    return h.digest();
  }

  public toPOD(): POD.Status.HookinAccepted {
    return {
      hash: this.hash().toPOD(),
      claimableHash: this.claimableHash.toPOD(),
      consolidationFee: this.consolidationFee,
      adversaryFee: this.adversaryFee,
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

    const adversaryFee = data.adversaryFee;
    
    if (adversaryFee) { 
      if (!POD.isAmount(adversaryFee)) { 
        throw new Error('HookinAccepted.fromPOD expectde an amount adversary fee or none at all.')
      }
    }

    return new HookinAccepted(claimableHash, consolidationFee, adversaryFee);
  }
}
