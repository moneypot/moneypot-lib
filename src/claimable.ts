import * as acknowledged from './acknowledged';
import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';
import { POD } from '.';


type ClaimableTypes = Hookout | FeeBump | LightningPayment | LightningInvoice | Hookin;

export default class Claimable {
  c: ClaimableTypes

  constructor(c: ClaimableTypes) {
    this.c = c;
  }

  hash() {
    return this.c.hash();
  }

  toPOD(): POD.Claimable {
    if (this.c instanceof Hookout) {
      return { kind: 'Hookout' as 'Hookout', ...this.c.toPOD()  }
    } else if (this.c instanceof FeeBump) {
      return { kind: 'FeeBump' as 'FeeBump', ...this.c.toPOD()  }
    }else if (this.c instanceof LightningPayment) {
      return { kind: 'LightningPayment' as 'LightningPayment', ...this.c.toPOD()  }
    }else if (this.c instanceof LightningInvoice) {
      return { kind: 'LightningInvoice' as 'LightningInvoice', ...this.c.toPOD()  }
    }else if (this.c instanceof Hookin) {
      return { kind: 'Hookin' as 'Hookin', ...this.c.toPOD()  }
    } else {
      const _: never = this.c;
      throw new Error('unknown claimable kind');
    }
  }

  static fromPOD(obj: any): Claimable | Error {
    if (typeof obj !== 'object') {
      return new Error('Claimable.fromPOD expected an object');
    }
    if (typeof obj.kind !== 'string') {
      return new Error('Claimable.fromPOD expected a string kind');
    }
    const parser = parserFromKind(obj.kind);
    if (!parser) {
      return new Error('Claimble.fromPOD couldnt handle that kind');
    }

    const parseRes = parser(obj);
    if (parseRes instanceof Error) {
      return parseRes;
    }

    return new Claimable(parseRes);
  }

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


