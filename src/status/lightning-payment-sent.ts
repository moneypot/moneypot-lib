import AbstractStatus from './abstract-status';

import Hash from '../hash';
import * as buffutils from '../util/buffutils';
import * as POD from '../pod';

export default class LightningPaymentSent extends AbstractStatus {
  paymentPreimage: Uint8Array;
  totalFees: number; // settlement amount

  constructor(claimableHash: Hash, paymentPreimage: Uint8Array, totalFees: number) {
    super(claimableHash);

    this.paymentPreimage = paymentPreimage;
    this.totalFees = totalFees;
  }

  hash() {
    return Hash.fromMessage(
      'LightningPaymentSent',
      this.buffer,
      this.paymentPreimage,
      buffutils.fromUint64(this.totalFees)
    );
  }

  toPOD(): POD.Status.LightningPaymentSent {
    return {
      claimableHash: this.claimableHash.toPOD(),
      paymentPreimage: buffutils.toHex(this.paymentPreimage),
      totalFees: this.totalFees,
    };
  }

  static fromPOD(obj: any): LightningPaymentSent | Error {
    if (typeof obj !== 'object') {
      return new Error('LightningPaymentSent.fromPOD expected an object');
    }

    const claimableHash = Hash.fromPOD(obj.claimableHash);
    if (claimableHash instanceof Error) {
      return claimableHash;
    }

    const paymentPreimage = buffutils.fromHex(obj.paymentPreimage, 32);
    if (paymentPreimage instanceof Error) {
      return paymentPreimage;
    }

    const totalFees = obj.totalFees;
    if (!POD.isAmount(totalFees)) {
      return new Error('LightningPaymentSent.fromPOD expected a valid totalFees');
    }

    return new LightningPaymentSent(claimableHash, paymentPreimage, totalFees);
  }
}
