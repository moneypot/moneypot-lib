import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';

export type Claimable = Hookout | FeeBump | LightningPayment | LightningInvoice | Hookin;

export function podToClaimable(obj: any): Claimable | Error {
  if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
    return new Error('parseTransfer expected an object with a kind to parse');
  }
  switch (obj.kind) {
    case 'Hookout':
      return Hookout.fromPOD(obj);
    case 'FeeBump':
      return FeeBump.fromPOD(obj);
    case 'LightningPayment':
      return LightningPayment.fromPOD(obj);
    default:
      throw new Error('parseTransfer unknown kind: ' + obj.kind);
  }
}

export function claimableToPod(c: Claimable) {
  if (c instanceof Hookout) {
    return { kind: 'Hookout', ...c.toPOD() };
  }
  if (c instanceof FeeBump) {
    return { kind: 'FeeBump', ...c.toPOD() };
  }
  if (c instanceof LightningPayment) {
    return { kind: 'LightningPayment', ...c.toPOD() };
  }
  if (c instanceof LightningInvoice) {
    return { kind: 'LightningInvoice', ...c.toPOD() };
  }
  if (c instanceof Hookin) {
    return { kind: 'Hookin', ...c.toPOD() };
  }
  const _: never = c;
  console.error('unknown claimable ', c);
  throw new Error('unknown claimable');
}
