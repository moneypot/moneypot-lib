import PublicKey from './public-key';
import Hash from './hash';
import * as buffutils from './util/buffutils';
import * as POD from './pod';

export default class LightningInvoice {

  beneficiary: PublicKey
  paymentRequest: string

  constructor(beneficiary: PublicKey, paymentRequest: string) {
    this.beneficiary = beneficiary;
    this.paymentRequest = paymentRequest;
  }

  hash() {
    return Hash.fromMessage('LightningInvoice', this.beneficiary.buffer, buffutils.fromString(this.paymentRequest));
  }

  toPOD(): POD.LightningInvoice {
    return {
      beneficiary: this.beneficiary.toPOD(),
      paymentRequest: this.paymentRequest,
    }
  }

  static fromPOD(data: any) {
    if (typeof data !== 'object') {
      return new Error('LightningInvoice.fromPOD expected an object');
    }

    // should we use bolt11 to validate the payment request?
    const beneficiary = PublicKey.fromPOD(data.beneficiary);
    if (beneficiary instanceof Error) {
      return new Error('lightninginvoice needs a publickey beneficiary');
    }

    const paymentRequest = data.paymentRequest;
    if (typeof paymentRequest !== 'string' || !paymentRequest.startsWith('ln')) {
      return new Error('expected valid payment request for lightninginvoice');
    }

    return {
      beneficiary,
      paymentRequest
    };
  }


}