import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import * as POD from './pod';
import Params from './params';

// P is used as the POD type that it returns
interface Acknowledgable<P> {
  hash(): Promise<Hash>;
  toPOD(): P;
}

// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
export default class Acknowledged<T extends Acknowledgable<P>, P> {
  public acknowledgement: Signature;
  public contents: T;

  public static async acknowledge<T extends Acknowledgable<P>, P>(contents: T, acknowledgeKey: PrivateKey) {
    const hash = await contents.hash();
    const acknowledgement = await Signature.compute(hash.buffer, acknowledgeKey);
    return new Acknowledged<T, P>(contents, acknowledgement);
  }

  public static async fromPOD<T extends Acknowledgable<P>, P>(
    creator: (data: any) => T | Error,
    data: any,
  ): Promise<Acknowledged<T, P>> {
    const contents = creator(data);
    if (contents instanceof Error) {
      throw contents;
    }

    const acknowledgement = Signature.fromBech(data.acknowledgement);
    if (acknowledgement instanceof Error) {
      throw acknowledgement;
    }

    const hash = await contents.hash();

    if (!acknowledgement.verify(hash.buffer, Params.acknowledgementPublicKey)) {
      throw new Error('acknowledgement does not verify');
    }

    return new Acknowledged<T, P>(contents, acknowledgement);
  }

  // Warning: The constructor does not validate the signature
  public constructor(contents: T, acknowledgement: Signature) {
    this.acknowledgement = acknowledgement;
    this.contents = contents;
  }

  public toPOD(): POD.Acknowledged & P {
    return {
      acknowledgement: this.acknowledgement.toBech(),
      ...this.contents.toPOD(),
    };
  }
}
