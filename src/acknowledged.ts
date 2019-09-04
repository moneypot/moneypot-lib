import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as POD from './pod';

import _Hookout from './hookout';
import _FeeBump from './fee-bump';

import _LightningPayment from './lightning-payment';
import _LightningInvoice from './lightning-invoice';
import _Hookin from './hookin';
import { Claimable as _Claimable, claimableFromPOD as _claimableFromPOD }from './claimable';

import _Status from './status';

// P is used as the POD type that it returns
interface Acknowledgable {
  hash(): Hash;
  toPOD(): object;
}

// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
export default class Acknowledged<T extends Acknowledgable> {
  public acknowledgement: Signature;
  public contents: T;

  public static acknowledge<T extends Acknowledgable>(contents: T, acknowledgeKey: PrivateKey) {
    const hash = contents.hash();
    const acknowledgement = Signature.compute(hash.buffer, acknowledgeKey);
    return new Acknowledged<T>(contents, acknowledgement);
  }

  // Need to check .verify()
  public static fromPOD<T extends Acknowledgable>(
    creator: (data: any) => T | Error,
    data: any
  ): Acknowledged<T> | Error {
    const contents = creator(data);
    if (contents instanceof Error) {
      throw contents;
    }

    const acknowledgement = Signature.fromPOD(data.acknowledgement);
    if (acknowledgement instanceof Error) {
      return acknowledgement;
    }

    return new Acknowledged<T>(contents, acknowledgement);
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

  public toPOD() {
    return {
      acknowledgement: this.acknowledgement.toPOD(),
      ...this.contents.toPOD(),
    };
  }
}

export type Hookin = Acknowledged<_Hookin>;
export function hookinFromPod(x: any): Hookin | Error {
  return Acknowledged.fromPOD(_Hookin.fromPOD, x);
}

export type FeeBump = Acknowledged<_FeeBump>;
export function feeBumpFromPod(x: any): FeeBump | Error {
  return Acknowledged.fromPOD(_FeeBump.fromPOD, x);
}

export type LightningPayment = Acknowledged<_LightningPayment>;
export function lightningPaymentFromPod(x: any): LightningPayment | Error {
  return Acknowledged.fromPOD(_LightningPayment.fromPOD, x);
}

export type LightningInvoice = Acknowledged<_LightningInvoice>;
export function lightningInvoiceFromPod(x: any): LightningInvoice | Error {
  return Acknowledged.fromPOD(_LightningInvoice.fromPOD, x);
}

export type Hookout = Acknowledged<_Hookout>;
export function hookoutFromPod(x: any): Hookout | Error {
  return Acknowledged.fromPOD(_Hookout.fromPOD, x);
}

export type Claimable = Acknowledged<_Claimable>;
export function claimableFromPOD(x: any): Claimable | Error {
  return Acknowledged.fromPOD(_claimableFromPOD, x);
}

export type Status = Acknowledged<_Status>;
export function statusFromPOD(x: any): Status | Error {
  return Acknowledged.fromPOD(_Status.fromPOD, x);
}


export function acknowledge(x: _Status, acknowledgeKey: PrivateKey): Status;
export function acknowledge(x: _Claimable, acknowledgeKey: PrivateKey): Claimable;
export function acknowledge(
  x: _Status | _Claimable,
  acknowledgeKey: PrivateKey
) {
  return Acknowledged.acknowledge(x, acknowledgeKey);
}
