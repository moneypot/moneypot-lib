import * as Buffutils from './util/buffutils';

import * as POD from './pod'

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
    if (!POD.isAmount(amount)) {
      return new Error('LightningPayment.fromPOD must have a int amount');
    }

    if (pro.satoshis && pro.satoshis !== amount) {
      return new Error('amount does not match invoice amount');
    }

    let feeLimit = data.feeLimit;
    if (!POD.isAmount(feeLimit)) {
      return new Error('LightningPayment.fromPOD must have a int feeLimit');
    }

    return new LightningPayment(data.paymentRequest, amount, feeLimit);
  }

  paymentRequest: string;
  amount: number;
  feeLimit: number;

  constructor(paymentRequest: string, amount: POD.Amount, feeLimit: POD.Amount) {
    this.paymentRequest = paymentRequest;
    this.amount = amount;
    this.feeLimit = feeLimit;
  }

  public toPOD(): POD.LightningPayment {
    return {
      amount: this.amount,
      paymentRequest: this.paymentRequest,
      feeLimit: this.feeLimit,
    };
  }

  public hash() {
    return LightningPayment.hashOf(this.paymentRequest, this.amount, this.feeLimit);
  }

  static hashOf(paymentRequest: string, amount: POD.Amount, feeLimit: POD.Amount) {
    const h = Hash.newBuilder('LightningPayment');

    h.update(Buffutils.fromString(paymentRequest));
    h.update(Buffutils.fromUint64(amount));
    h.update(Buffutils.fromUint64(feeLimit));


    return h.digest();
  }
}
