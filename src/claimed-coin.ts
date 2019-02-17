import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import Signature from './signature';
import * as Buffutils from './util/buffutils';

export default class ClaimedCoin {
  public static fromPOD(data: any): ClaimedCoin | Error {
    const owner = PublicKey.fromBech(data.owner);
    if (owner instanceof Error) {
      return owner;
    }

    const magnitude = data.magnitude;
    if (!POD.isMagnitude(magnitude)) {
      return new Error('invalid magnitude for coin');
    }
    const existenceProof = Signature.fromBech(data.existenceProof);
    if (existenceProof instanceof Error) {
      return existenceProof;
    }

    return new ClaimedCoin(owner, magnitude, existenceProof);
  }

  public owner: PublicKey;
  public magnitude: POD.Magnitude;
  public existenceProof: Signature;

  constructor(owner: PublicKey, magnitude: POD.Magnitude, existenceProof: Signature) {
    this.owner = owner;
    this.magnitude = magnitude;
    this.existenceProof = existenceProof;
  }

  public hash() {
    return Hash.fromMessage(
      'ClaimedCoin',
      this.owner.buffer,
      Buffutils.fromUint8(this.magnitude),
      this.existenceProof.buffer
    );
  }

  public toPOD(): POD.ClaimedCoin {
    return {
      existenceProof: this.existenceProof.toBech(),
      magnitude: this.magnitude,
      owner: this.owner.toBech(),
    };
  }
}
