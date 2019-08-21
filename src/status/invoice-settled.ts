import AbstractStatus from './abstract-status';

import Hash from '../hash';
import * as buffutils from '../util/buffutils';
import { POD } from '..';

export default class InvoiceSettled extends AbstractStatus {
  amount: number; // settlement amount
  rPreimage: Uint8Array; // hex
  time: Date; // settlement time

  constructor(claimableHash: Uint8Array, amount: number, rPreimage: Uint8Array, time: Date) {
    super(claimableHash);
    this.amount = amount;
    this.rPreimage = rPreimage;
    this.time = time;
  }

  hash() {
    return Hash.fromMessage(
      'InvoiceSettled',
      this.buffer,
      buffutils.fromUint64(this.amount),
      this.rPreimage,
      buffutils.fromUint64(this.time.getTime())
    );
  }

  toPOD(): POD.Status.InvoiceSettled {
    return {
      claimableHash: buffutils.toHex(this.claimableHash),
      amount: this.amount,
      rPreimage: buffutils.toHex(this.rPreimage),
      time: this.time.toISOString(),
    };
  }

  static fromPOD(obj: any): InvoiceSettled | Error {
    if (typeof obj !== 'object') {
      return new Error('BitcoinTransactionSent.fromPOD expected an object');
    }

    const claimableHash = buffutils.fromHex(obj.claimableHash, 32);
    if (claimableHash instanceof Error) {
      return claimableHash;
    }

    const amount = obj.amount;
    if (!POD.isAmount(amount)) {
      return new Error('InvoiceSettled.fromPOD expected a valid amount');
    }

    const rPreimage = buffutils.fromHex(obj.rPreimage, 32);
    if (rPreimage instanceof Error) {
      return rPreimage;
    }

    const ms = Date.parse(obj.time);
    if (!Number.isFinite(ms)) {
      return new Error('InvoiceSettled.fromPOD expected a valid time');
    }
    const time = new Date(ms);
    if (time.toISOString() !== obj.time) {
      // canonical check...
      return new Error('InvoiceSettled.fromPOD got a strangely formatted time');
    }

    return new InvoiceSettled(claimableHash, amount, rPreimage, time);
  }
}
