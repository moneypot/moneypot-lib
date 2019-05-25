import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import Signature from './signature';
import Magnitude from './magnitude';
import * as Buffutils from './util/buffutils';


export default class Coin {
  public static fromPOD(data: any): Coin | Error {
    const owner = PublicKey.fromPOD(data.owner);
    if (owner instanceof Error) {
      return owner;
    }

    const magnitude = Magnitude.fromPOD(data.magnitude);
    if (magnitude instanceof Error) {
      return magnitude;
    }

    const receipt = Signature.fromPOD(data.receipt);
    if (receipt instanceof Error) {
      return receipt;
    }

    return new Coin(owner, magnitude, receipt);
  }

  public owner: PublicKey;
  public magnitude: Magnitude;
  public receipt: Signature;

  constructor(owner: PublicKey, magnitude: Magnitude, receipt: Signature) {
    this.owner = owner;
    this.magnitude = magnitude;
    this.receipt = receipt;
  }

  get buffer() {
    return Buffutils.concat(this.owner.buffer, this.magnitude.buffer, this.receipt.buffer);
  }

  public hash() {
    return Hash.fromMessage('Coin', this.buffer);
  }

  public toPOD(): POD.Coin {
    return {
      receipt: this.receipt.toPOD(),
      magnitude: this.magnitude.toPOD(),
      owner: this.owner.toPOD(),
    };
  }

  public get amount(): number {
    return this.magnitude.toAmount();
  }

}
