import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-invoice';
export declare function parseTransfer(obj: any): Hookout | FeeBump | LightningPayment | Error;
