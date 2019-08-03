import Acknowledged, * as acknowledged from './acknowledged';

export type Claimable = acknowledged.Hookout | acknowledged.FeeBump | acknowledged.LightningPayment | acknowledged.LightningInvoice | acknowledged.Hookin;


const parsers = new Map<string, (obj: any) => Claimable | Error>([
    ['Hookout', acknowledged.hookinFromPod],
    ['FeeBump', acknowledged.feeBumpFromPod],
    ['LightningPayment', acknowledged.lightningPaymentFromPod],
    ['LightningInvoice', acknowledged.lightningInvoiceFromPod],
    ['Hookin', acknowledged.hookinFromPod]
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

export function claimableToPod(c: Claimable) {
    const kind = c.contents.constructor.name;
    if (!parsers.has(kind)) {
        throw new Error('could not serialize a: ' + kind + ' as we have no parsers for such a thing');
    }

    return { kind, ...c.toPOD() };
}
