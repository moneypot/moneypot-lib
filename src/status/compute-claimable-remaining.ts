import Claimable from '../claimable';
import Status from './index';
import Failed from './failed';
import Claimed from './claimed';
import LightningPaymentSent from './lightning-payment-sent';

export default function computeClaimableRemaining(claimable: Claimable, statuses: Status[]) {
  const c = claimable.c;

  let remaining = c.amount;

  for (const { s } of statuses) {
    if (s instanceof Failed) {
      remaining += s.rebate;
    } else if (s instanceof Claimed) {
      remaining -= s.claimRequest.amount();
    } else if (s instanceof LightningPaymentSent) {
      const overpaid = c.fee - s.totalFees;
      if (overpaid <= 0) {
        throw new Error('assertion failed, actual lightning fees higher than paid: ' + claimable.hash);
      }
      remaining += overpaid;
    }
  }

  if (remaining < 0) {
    throw new Error('assertion failed, claimable remaining is less than 0: ' + claimable.hash);
  }

  return remaining;
}
