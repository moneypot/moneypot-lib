import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import Signature from './signature';
import Magnitude from './magnitude';

import * as Buffutils from './util/buffutils';

export default class Coin {
  public static fromPOD(data: any): Coin | Error {
    const owner = PublicKey.fromBech(data.owner);
    if (owner instanceof Error) {
      return owner;
    }

    const magnitude = Magnitude.fromPOD(data.magnitude);
    if (magnitude instanceof Error) {
      return magnitude;
    }

    const existenceProof = Signature.fromBech(data.existenceProof);
    if (existenceProof instanceof Error) {
      return existenceProof;
    }

    return new Coin(owner, magnitude, existenceProof);
  }

  public owner: PublicKey;
  public magnitude: Magnitude;
  public existenceProof: Signature;

  constructor(owner: PublicKey, magnitude: Magnitude, existenceProof: Signature) {
    this.owner = owner;
    this.magnitude = magnitude;
    this.existenceProof = existenceProof;
  }

  public hash() {
    return Hash.fromMessage(
      'Coin',
      this.owner.buffer,
      this.magnitude.buffer,
      this.existenceProof.buffer
    );
  }

  public toPOD(): POD.Coin {
    return {
      existenceProof: this.existenceProof.toBech(),
      magnitude: this.magnitude.toPOD(),
      owner: this.owner.toBech(),
    };
  }
}
