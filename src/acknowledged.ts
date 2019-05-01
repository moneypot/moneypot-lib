import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import * as POD from './pod';
import Params from './params';
import { PublicKey } from '.';

// P is used as the POD type that it returns
interface Acknowledgable<P> {
  hash(): Hash;
  toPOD(): P;
}

// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
export default class Acknowledged<T extends Acknowledgable<P>, P> {
  public acknowledgement: Signature;
  public contents: T;

  public static acknowledge<T extends Acknowledgable<P>, P>(contents: T, acknowledgeKey: PrivateKey) {
    const hash = contents.hash();
    const acknowledgement = Signature.compute(hash.buffer, acknowledgeKey);
    return new Acknowledged<T, P>(contents, acknowledgement);
  }

  // Need to check .verify() 
  public static fromPOD<T extends Acknowledgable<P>, P>(
    creator: (data: any) => T | Error,
    data: any
  ): Acknowledged<T, P> | Error {
    const contents = creator(data);
    if (contents instanceof Error) {
      throw contents;
    }

    const acknowledgement = Signature.fromPOD(data.acknowledgement);
    if (acknowledgement instanceof Error) {
      return acknowledgement;
    }

    return new Acknowledged<T, P>(contents, acknowledgement);
  }

  public verify(acknowledgementPublicKey: PublicKey) {
    const hash = this.contents.hash();

    return this.acknowledgement.verify(hash.buffer, acknowledgementPublicKey);
  }

  public hash() {
    return this.contents.hash();
  }

  // Warning: The constructor does not validate the signature
  public constructor(contents: T, acknowledgement: Signature) {
    this.acknowledgement = acknowledgement;
    this.contents = contents;
  }

  public toPOD(): POD.Acknowledged & P {
    return {
      acknowledgement: this.acknowledgement.toPOD(),
      ...this.contents.toPOD(),
    };
  }
}
