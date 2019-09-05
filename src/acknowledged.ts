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
import { Claimable as _Claimable, claimableFromPOD as _claimableFromPOD, claimableToPOD }from './claimable';

import _Status from './status';

// P is used as the POD type that it returns
interface Acknowledgable {
  hash(): Hash;
}

// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
export default class Acknowledged<T extends Acknowledgable, P> {
  public acknowledgement: Signature;
  public contents: T;
  public toPOD: () => P & POD.Acknowledged;

  public static acknowledge<T extends Acknowledgable, P>(contents: T, acknowledgeKey: PrivateKey, toPOD: (x: T) => P) {
    const hash = contents.hash();
    const acknowledgement = Signature.compute(hash.buffer, acknowledgeKey);
    return new Acknowledged<T, P>(contents, acknowledgement, toPOD);
  }

  // Need to check .verify()
  public static fromPOD<T extends Acknowledgable, P>(
    creator: (data: any) => T | Error,
    toPOD: (x: T) => P,
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

    return new Acknowledged<T, P>(contents, acknowledgement, toPOD);
  }

  public verify(acknowledgementPublicKey: PublicKey) {
    const hash = this.contents.hash();

    return this.acknowledgement.verify(hash.buffer, acknowledgementPublicKey);
  }

  public hash() {
    return this.contents.hash();
  }

  // Warning: The constructor does not validate the signature
  public constructor(contents: T, acknowledgement: Signature, toPOD: (x: T) => P, ) {
    this.acknowledgement = acknowledgement;
    this.contents = contents;
    this.toPOD = () => ({
      acknowledgement: this.acknowledgement.toPOD(),
      ...toPOD(this.contents),
    });
  }
}

export type Hookin = Acknowledged<_Hookin, POD.Hookin>;
export function hookinFromPod(x: any): Hookin | Error {
  return Acknowledged.fromPOD(_Hookin.fromPOD, (d: _Hookin) => d.toPOD(),  x);
}

export type FeeBump = Acknowledged<_FeeBump, POD.FeeBump>;
export function feeBumpFromPod(x: any): FeeBump | Error {
  return Acknowledged.fromPOD(_FeeBump.fromPOD, (d: _FeeBump) => d.toPOD(), x);
}

export type LightningPayment = Acknowledged<_LightningPayment, POD.LightningPayment>;
export function lightningPaymentFromPod(x: any): LightningPayment | Error {
  return Acknowledged.fromPOD(_LightningPayment.fromPOD, (d: _LightningPayment) => d.toPOD(), x);
}

export type LightningInvoice = Acknowledged<_LightningInvoice, POD.LightningInvoice>;
export function lightningInvoiceFromPod(x: any): LightningInvoice | Error {
  return Acknowledged.fromPOD(_LightningInvoice.fromPOD, (d: _LightningInvoice) => d.toPOD(), x);
}

export type Hookout = Acknowledged<_Hookout, POD.Hookout>;
export function hookoutFromPod(x: any): Hookout | Error {
  return Acknowledged.fromPOD(_Hookout.fromPOD, (d: _Hookout) => d.toPOD(), x);
}

export type Claimable = Acknowledged<_Claimable, POD.Claimable>;
export function claimableFromPOD(x: any): Claimable | Error {
  return Acknowledged.fromPOD(_claimableFromPOD, claimableToPOD, x);
}

export type Status = Acknowledged<_Status, POD.Status>;
export function statusFromPOD(x: any): Status | Error {
  return Acknowledged.fromPOD(_Status.fromPOD, (d: _Status) => d.toPOD(), x);
}


export function acknowledge(x: _Status, acknowledgeKey: PrivateKey): Status;
export function acknowledge(x: _Claimable, acknowledgeKey: PrivateKey): Claimable;
export function acknowledge(
  x: _Status | _Claimable,
  acknowledgeKey: PrivateKey
) {

  if (x instanceof _Hookout ||
    x instanceof _FeeBump ||
    x instanceof _LightningPayment ||
    x instanceof _LightningInvoice ||
    x instanceof _Hookin) {
      return Acknowledged.acknowledge(x, acknowledgeKey, claimableToPOD);
    } else {
      return Acknowledged.acknowledge(x, acknowledgeKey, (z: _Status) => z.toPOD());
    }
}
