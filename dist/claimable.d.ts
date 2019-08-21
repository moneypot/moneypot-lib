import Hookout from './hookout';
import FeeBump from './fee-bump';
import LightningPayment from './lightning-payment';
import LightningInvoice from './lightning-invoice';
import Hookin from './hookin';
import { POD } from '.';
declare type ClaimableTypes = Hookout | FeeBump | LightningPayment | LightningInvoice | Hookin;
export default class Claimable {
    c: ClaimableTypes;
    constructor(c: ClaimableTypes);
    hash(): import("./hash").default;
    toPOD(): POD.Claimable;
    static fromPOD(obj: any): Claimable | Error;
}
export declare function parserFromKind(kind: string): typeof Hookin.fromPOD | typeof FeeBump.fromPOD | typeof LightningInvoice.fromPOD | typeof Hookout.fromPOD | undefined;
export {};
