import * as acknowledged from './acknowledged';
import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';

export type Claimable =
  | acknowledged.Hookout
  | acknowledged.FeeBump
  | acknowledged.LightningPayment
  | acknowledged.LightningInvoice
  | acknowledged.Hookin;

const parsers = new Map<string, (obj: any) => Claimable | Error>([
  ['Hookout', acknowledged.hookinFromPod],
  ['FeeBump', acknowledged.feeBumpFromPod],
  ['LightningPayment', acknowledged.lightningPaymentFromPod],
  ['LightningInvoice', acknowledged.lightningInvoiceFromPod],
  ['Hookin', acknowledged.hookinFromPod],
]);

export function podToClaimable(obj: any): Claimable | Error {
  if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
    return new Error('parseTransfer expected an object with a kind to parse');
  }
  const parser = parsers.get(obj.kind);
  if (!parser) {
    return new Error('could not parse a: ' + obj.kind);
  }

  return parser(obj);
}

export function claimableToPod(claimable: Claimable) {
  const c = claimable.contents;
  if (c instanceof Hookout) {
    return { kind: 'Hookout' as 'Hookout', ...c.toPOD() };
  } else if (c instanceof FeeBump) {
    return { kind: 'FeeBump' as 'FeeBump', ...c.toPOD() };
  } else if (c instanceof LightningPayment) {
    return { kind: 'LightningPayment' as 'LightningPayment', ...c.toPOD() };
  } else if (c instanceof LightningInvoice) {
    return { kind: 'LightningInvoice' as 'LightningInvoice', ...c.toPOD() };
  } else if (c instanceof Hookin) {
    return { kind: 'Hookin' as 'Hookin', ...c.toPOD() };
  } else {
    const _: never = c;
    throw new Error('did not know what a: ' + c + ' is');
  }
}
