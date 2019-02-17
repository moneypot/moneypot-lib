import PublicKey from './public-key';
import * as POD from './pod';
import Hash from './hash';
import * as buffutils from './util/buffutils';

export default class ClaimableCoin {
  public static fromPOD(data: any): ClaimableCoin | Error {
    const claimant = PublicKey.fromBech(data.claimant);
    if (claimant instanceof Error) {
      return claimant;
    }

    const magnitude = data.magnitude;
    if (!POD.isMagnitude(magnitude)) {
      return new Error('invalid magnitude');
    }

    return new ClaimableCoin(claimant, magnitude);
  }

  public claimant: PublicKey;
  public magnitude: number;

  constructor(claimant: PublicKey, magnitude: POD.Magnitude) {
    this.claimant = claimant;
    this.magnitude = magnitude;
  }

  public hash() {
    const h = Hash.newBuilder('ClaimableCoin');

    h.update(this.claimant.buffer);
    h.update(buffutils.fromUint8(this.magnitude));

    return h.digest();
  }

  public toPOD(): POD.ClaimableCoin {
    return {
      claimant: this.claimant.toBech(),
      magnitude: this.magnitude,
    };
  }
}
