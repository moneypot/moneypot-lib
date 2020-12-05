import PublicKey from './public-key';
import Hash from './hash';
import * as buffutils from './util/buffutils';
import * as POD from './pod';
import AbstractClaimable from './abstract-claimable';

export default class LightningInvoice implements AbstractClaimable {
  claimant: PublicKey;
  paymentRequest: string;
  initCreated?: number;

  constructor(claimant: PublicKey, paymentRequest: string, initCreated?: number) {
    this.claimant = claimant;
    this.paymentRequest = paymentRequest;
    this.initCreated = initCreated;
  }

  hash() {
    return Hash.fromMessage('LightningInvoice', this.claimant.buffer, buffutils.fromString(this.paymentRequest));
  }

  toPOD(): POD.LightningInvoice {
    return {
      hash: this.hash().toPOD(),
      claimant: this.claimant.toPOD(),
      paymentRequest: this.paymentRequest,
      initCreated: this.initCreated,
    };
  }

  get fee() {
    return 0;
  }

  get amount() {
    return 0;
  }

  get claimableAmount() {
    return 0;
  }

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

    const initCreated = data.initCreated;
    if (initCreated) {
      if (typeof initCreated != 'number') {
        throw initCreated;
      }
    }

    return new LightningInvoice(claimant, paymentRequest, initCreated);
  }
}
