import { Claimable } from '../claimable';
import { Status } from './index';
import Failed from './failed';
import Claimed from './claimed';
import LightningPaymentSent from './lightning-payment-sent';
import BitcoinTransactionSent from './bitcoin-transaction-sent';
import InvoiceSettled from './invoice-settled';
import HookinAccepted from './hookin-accepted';
import Hookin from '../hookin';
import LightningPayment from '../lightning-payment';

export default function computeClaimableRemaining(c: Claimable, statuses: Status[]) {
  let remaining = c.claimableAmount;

  for (const s of statuses) {
    if (s instanceof Failed) {
      remaining += s.rebate;
    } else if (s instanceof Claimed) {
      remaining -= s.claimRequest.amount();
    } else if (s instanceof LightningPaymentSent) {
      if (!(c instanceof LightningPayment)) {
        throw new Error('got lighting payment sent status for a non lightning payment?');
      }
      const overpaid = c.fee - s.totalFees;
      if (overpaid < 0) {
        throw new Error('assertion failed, actual lightning fees higher than paid: ' + c.hash().toPOD());
      }
      remaining += overpaid;
    } else if (s instanceof InvoiceSettled) {
      remaining += s.amount;
    } else if (s instanceof BitcoinTransactionSent) {
      // do nothing
    } else if (s instanceof HookinAccepted) {
      if (!(c instanceof Hookin)) {
        throw new Error('assertion failure. hookin accepted for non-hookin?!');
      }

      remaining += Math.max(c.amount - s.consolidationFee, 0);
    } else {
      const _: never = s;
      throw new Error('Unexpected Status: ' + s);
    }
  }

  if (remaining < 0) {
    throw new Error('assertion failed, claimable remaining is less than 0: ' + c.hash().toPOD());
  }

  return remaining;
}
