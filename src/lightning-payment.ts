import * as Buffutils from './util/buffutils';

import Hash from './hash';

import * as bolt11 from './bolt11';

export default class LightningPayment {
  public static fromPOD(data: any): LightningPayment | Error {
    if (typeof data !== 'string') {
      return new Error('LightningPayment.fromPOD is not string');
    }

    let pro;
    try {
      pro = bolt11.decodeBolt11(data);
    } catch (err) {
      console.warn('warn: bolt11 decode error: ', err);
      return new Error('could not decode lightning paymentRequest');
    }

    return new LightningPayment(pro);
  }

  paymentRequestObject: bolt11.PaymentRequestObject;

  constructor(paymentRequestObject: bolt11.PaymentRequestObject) {
    this.paymentRequestObject = paymentRequestObject;
  }

  public toPOD(): string {
    return bolt11.encodeBolt11(this.paymentRequestObject);
  }

  public hash() {
    return LightningPayment.hashOf(this.toPOD());
  }

  static hashOf(paymentRequest: string) {
    const h = Hash.newBuilder('LightningPayment');

    h.update(Buffutils.fromString(paymentRequest));

    return h.digest();
  }

  get amount() {
    return this.paymentRequestObject.satoshis;
  }

  setAmount(satoshis: number) {
    this.paymentRequestObject.satoshis = satoshis;
    this.paymentRequestObject.millisatoshis = BigInt(satoshis) * BigInt(1000);
  }
}
