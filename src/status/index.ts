import Claimed from './claimed';
import Failed from './failed';
import BitcoinTransactionSent from './bitcoin-transaction-sent';
import InvoiceSettled from './invoice-settled';

import * as POD from '../pod';

type StatusType = Claimed | Failed | BitcoinTransactionSent | InvoiceSettled;

export default class Status {
  s: StatusType;

  constructor(s: StatusType) {
    this.s = s;
  }

  static fromPOD(obj: any): Status | Error {
    if (typeof obj !== 'object' || typeof obj.kind !== 'string') {
      return new Error('parseTransfer expected an object with a kind to parse');
    }

    const parser = findParser(obj.kind);
    if (parser instanceof Error) {
      return parser;
    }

    const parseResult = parser(obj);
    if (parseResult instanceof Error) {
      return parseResult;
    }

    return new Status(parseResult);
  }

  toPOD(): POD.Status {
    return statusToPOD(this.s);
  }

  hash() {
    return this.s.hash();
  }

  claimableHash() {
    return this.s.claimableHash;
  }
}

function findParser(kind: string) {
  switch (kind) {
    case 'Failed':
      return Failed.fromPOD;
    case 'BitcoinTransactionSent':
      return BitcoinTransactionSent.fromPOD;
    case 'InvoiceSettled':
      return InvoiceSettled.fromPOD;
    case 'Claimed':
      return Claimed.fromPOD;
    default:
      return new Error('Unknown status kind: ' + kind);
  }
}

function statusToPOD(s: StatusType) {
  if (s instanceof BitcoinTransactionSent) {
    return { kind: 'BitcoinTransactionSent' as 'BitcoinTransactionSent', ...s.toPOD() };
  } else if (s instanceof Failed) {
    return { kind: 'Failed' as 'Failed', ...s.toPOD() };
  } else if (s instanceof InvoiceSettled) {
    return { kind: 'InvoiceSettled' as 'InvoiceSettled', ...s.toPOD() };
  } else if (s instanceof Claimed) {
    return { kind: 'Claimed' as 'Claimed', ...s.toPOD() };
  } else {
    const _: never = s;
    throw new Error('uknown status: ' + s);
  }
}
