import PublicKey from './public-key';
import Hash from './hash';
import * as buffutils from './util/buffutils';
import * as POD from './pod';

export default class LightningInvoice {
  claimant: PublicKey;
  paymentRequest: string;

  constructor(claimant: PublicKey, paymentRequest: string) {
    this.claimant = claimant;
    this.paymentRequest = paymentRequest;
  }

  hash() {
    return Hash.fromMessage('LightningInvoice', this.claimant.buffer, buffutils.fromString(this.paymentRequest));
  }

  toPOD(): POD.LightningInvoice {
    return {
      claimant: this.claimant.toPOD(),
      paymentRequest: this.paymentRequest,
    };
  }

  static fromPOD(data: any) {
    if (typeof data !== 'object') {
      return new Error('LightningInvoice.fromPOD expected an object');
    }

    // should we use bolt11 to validate the payment request?
    const claimant = PublicKey.fromPOD(data.claimant);
    if (claimant instanceof Error) {
      return new Error('lightninginvoice needs a publickey claimant');
    }

    const paymentRequest = data.paymentRequest;
    if (typeof paymentRequest !== 'string' || !paymentRequest.startsWith('ln')) {
      return new Error('expected valid payment request for lightninginvoice');
    }

    return new LightningInvoice(claimant, paymentRequest);
  }
}
