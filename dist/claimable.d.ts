import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';
import { POD } from '.';
export declare type Claimable = Hookout | FeeBump | LightningPayment | LightningInvoice | Hookin;
export declare function claimableToPOD(c: Claimable): POD.Claimable;
export declare function claimableFromPOD(obj: any): Claimable | Error;
export declare function parserFromKind(kind: string): typeof Hookout.fromPOD | typeof FeeBump.fromPOD | typeof LightningPayment.fromPOD | typeof LightningInvoice.fromPOD | typeof Hookin.fromPOD | undefined;
