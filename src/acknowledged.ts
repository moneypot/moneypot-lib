import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import * as POD from './pod';
import { PublicKey } from '.';

import _ClaimResponse from './claim-response';
import _Hookout from './hookout';
import _FeeBump from './fee-bump';
import _LightningPayment from './lightning-payment';
import _LightningInvoice from './lightning-invoice';
import _Hookin from './hookin';


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

export type ClaimResponse = Acknowledged<_ClaimResponse, POD.ClaimResponse>;
export function claimResponse(x: any): ClaimResponse | Error {
  return Acknowledged.fromPOD(_ClaimResponse.fromPOD, x);
}

export type Hookin = Acknowledged<_Hookin, POD.Hookin>;
export function hookinFromPod(x: any): Hookin | Error {
  return Acknowledged.fromPOD(_Hookin.fromPOD, x);
}

export type FeeBump = Acknowledged<_FeeBump, POD.FeeBump>;
export function feeBumpFromPod(x: any): FeeBump | Error {
  return Acknowledged.fromPOD(_FeeBump.fromPOD, x);
}

export type LightningPayment = Acknowledged<_LightningPayment, POD.LightningPayment>;
export function lightningPaymentFromPod(x: any): LightningPayment | Error {
  return Acknowledged.fromPOD(_LightningPayment.fromPOD, x);
}


export type LightningInvoice = Acknowledged<_LightningInvoice, POD.LightningInvoice>;
export function lightningInvoiceFromPod(x: any): LightningInvoice | Error {
  return Acknowledged.fromPOD(_LightningInvoice.fromPOD, x);
}


export type Hookout = Acknowledged<_Hookout, POD.Hookout>;
export function hookoutFromPod(x: any): Hookout | Error {
  return Acknowledged.fromPOD(_Hookout.fromPOD, x);
}

export function acknowledge(x: _ClaimResponse, acknowledgeKey: PrivateKey): ClaimResponse;
export function acknowledge(x: _Hookin, acknowledgeKey: PrivateKey): Hookin;
export function acknowledge(x: _Hookout, acknowledgeKey: PrivateKey): Hookout;
export function acknowledge(x: _LightningPayment, acknowledgeKey: PrivateKey): LightningPayment;
export function acknowledge(x: _LightningInvoice, acknowledgeKey: PrivateKey): LightningInvoice;
export function acknowledge(x: _FeeBump, acknowledgeKey: PrivateKey): FeeBump;
export function acknowledge(x: _ClaimResponse | _Hookin | _Hookout | _LightningInvoice | _LightningPayment | _FeeBump, acknowledgeKey: PrivateKey) {
  return Acknowledged.acknowledge(x, acknowledgeKey);
}