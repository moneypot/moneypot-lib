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

    let fee = data.fee;
    if (!POD.isAmount(fee)) {
      return new Error('LightningPayment.fromPOD must have a int fee');
    }

    return new LightningPayment(data.paymentRequest, amount, fee);
  }

  paymentRequest: string;
  amount: number;
  fee: number;

  constructor(paymentRequest: string, amount: POD.Amount, fee: POD.Amount) {
    this.paymentRequest = paymentRequest;
    this.amount = amount;
    this.fee = fee;
  }

  public toPOD(): POD.LightningPayment {
    return {
      amount: this.amount,
      paymentRequest: this.paymentRequest,
      fee: this.fee,
    };
  }

  public hash() {
    return LightningPayment.hashOf(this.paymentRequest, this.amount, this.fee);
  }

  static hashOf(paymentRequest: string, amount: POD.Amount, feeLimit: POD.Amount) {
    const h = Hash.newBuilder('LightningPayment');

    h.update(Buffutils.fromString(paymentRequest));
    h.update(Buffutils.fromUint64(amount));
    h.update(Buffutils.fromUint64(feeLimit));


    return h.digest();
  }
}
