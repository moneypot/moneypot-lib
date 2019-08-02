import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
export declare type Transfer = Hookout | FeeBump | LightningPayment;
export declare function parseTransfer(obj: any): Hookout | FeeBump | LightningPayment | Error;
