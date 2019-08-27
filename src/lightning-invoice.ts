import PublicKey from './public-key';
import Hash from './hash';
import * as buffutils from './util/buffutils';
import * as POD from './pod';
import AbstractClaimable from './abstract-claimable';

export default class LightningInvoice implements AbstractClaimable {
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
      hash: this.hash().toPOD(),
      claimant: this.claimant.toPOD(),
      paymentRequest: this.paymentRequest,
    };
  }

  get fee() {
    return 0;
  }
  get amount() {
    return 0;
  } // This is from abstractclaimable. By itself an a lightninginvoice has nothing claimable, until it's paid
  get kind(): 'LightningInvoice' {
    return 'LightningInvoice';
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
