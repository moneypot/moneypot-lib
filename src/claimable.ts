import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';
import { POD } from '.';

export type Claimable = Hookout | FeeBump | LightningPayment | LightningInvoice | Hookin;

export function claimableToPOD(c: Claimable): POD.Claimable {
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
    throw new Error('unknown claimable kind');
  }
}

export function claimableFromPOD(obj: any): Claimable | Error {
  if (typeof obj !== 'object') {
    return new Error('claimableFromPOD expected an object');
  }
  if (typeof obj.kind !== 'string') {
    return new Error('claimableFromPOD expected a string kind');
  }
  const parser = parserFromKind(obj.kind);
  if (!parser) {
    return new Error('claimableFromPODcouldnt handle that kind');
  }

  const c = parser(obj);
  if (c instanceof Error) {
    return c;
  }

  if (c.hash().toPOD() !== obj.hash) {
    return new Error('hash did not match');
  }
  return c;
}

export function parserFromKind(kind: string) {
  switch (kind) {
    case 'Hookout':
      return Hookout.fromPOD;
    case 'FeeBump':
      return FeeBump.fromPOD;
    case 'LightningPayment':
      return LightningPayment.fromPOD;
    case 'LightningInvoice':
      return LightningInvoice.fromPOD;
    case 'Hookin':
      return Hookin.fromPOD;
  }
}

// export function podToClaimable(obj: any): Claimable | Error {
//   if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
//     return new Error('parseTransfer expected an object with a kind to parse');
//   }
//   const parser = parsers.get(obj.kind);
//   if (!parser) {
//     return new Error('could not parse a: ' + obj.kind);
//   }

//   return parser(obj);
// }
