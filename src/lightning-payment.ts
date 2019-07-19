import * as Buffutils from './util/buffutils';

import Hash from './hash';

import * as bolt11 from './bolt11';

export default class LightningPayment {
  public static fromPOD(data: any): LightningPayment | Error {
    if (typeof data !== 'object') {
      return new Error('LightningPayment.fromPOD is not an object');
    }

    let pro;
    try {
      pro = bolt11.decodeBolt11(data.paymentRequest);
    } catch (err) {
      console.warn('warn: bolt11 decode error: ', err);
      return err;
    }

    let amount = data.amount;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return new Error('LightningPayment.fromPOD must have a natural amount');
    }

    if (pro.satoshis && pro.satoshis !== amount) {
      return new Error('amount does not match invoice amount');
    }

    return new LightningPayment(data.paymentRequest, amount);
  }

  paymentRequest: string;
  amount: number;

  constructor(paymentRequest: string, amount: number) {
    this.paymentRequest = paymentRequest;
    this.amount = amount;
  }

  public toPOD() {
    return { paymentRequest: this.paymentRequest, amount: this.amount };
  }

  public hash() {
    return LightningPayment.hashOf(this.paymentRequest, this.amount);
  }

  static hashOf(paymentRequest: string, amount: number) {
    const h = Hash.newBuilder('LightningPayment');

    h.update(Buffutils.fromString(paymentRequest));
    h.update(Buffutils.fromUint64(amount));

    return h.digest();
  }
}
