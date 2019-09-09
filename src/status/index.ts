import Claimed from './claimed';
import Failed from './failed';
import BitcoinTransactionSent from './bitcoin-transaction-sent';
import InvoiceSettled from './invoice-settled';
import LightningPaymentSent from './lightning-payment-sent';
import HookinAccepted from './hookin-accepted';

export type Status = Claimed | Failed | BitcoinTransactionSent | InvoiceSettled | LightningPaymentSent | HookinAccepted;

export function statusFromPOD(obj: any): Status | Error {
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

  if (parseResult.hash().toPOD() !== obj.hash) {
    return new Error('status had mismatching hash');
  }

  return parseResult;
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
    case 'LightningPaymentSent':
      return LightningPaymentSent.fromPOD;
    case 'HookinAccepted':
      return HookinAccepted.fromPOD;
    default:
      return new Error('Unknown status kind: ' + kind);
  }
}

export function statusToPOD(s: Status) {
  if (s instanceof BitcoinTransactionSent) {
    return { kind: 'BitcoinTransactionSent' as 'BitcoinTransactionSent', ...s.toPOD() };
  } else if (s instanceof Failed) {
    return { kind: 'Failed' as 'Failed', ...s.toPOD() };
  } else if (s instanceof InvoiceSettled) {
    return { kind: 'InvoiceSettled' as 'InvoiceSettled', ...s.toPOD() };
  } else if (s instanceof Claimed) {
    return { kind: 'Claimed' as 'Claimed', ...s.toPOD() };
  } else if (s instanceof LightningPaymentSent) {
    return { kind: 'LightningPaymentSent' as 'LightningPaymentSent', ...s.toPOD() };
  } else if (s instanceof HookinAccepted) {
    return { kind: 'HookinAccepted' as 'HookinAccepted', ...s.toPOD() };
  } else {
    const _: never = s;
    throw new Error('uknown status: ' + s);
  }
}
