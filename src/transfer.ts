
import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';


export type Transfer = Hookout | FeeBump | LightningPayment;


export function parseTransfer(obj: any): Hookout | FeeBump | LightningPayment | Error {
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