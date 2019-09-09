import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as POD from './pod';
import _Hookout from './hookout';
import _FeeBump from './fee-bump';
import _LightningPayment from './lightning-payment';
import _LightningInvoice from './lightning-invoice';
import _Hookin from './hookin';
import { Claimable as _Claimable } from './claimable';
import { Status as _Status } from './status';
interface Acknowledgable {
    hash(): Hash;
}
export default class Acknowledged<T extends Acknowledgable, P> {
    acknowledgement: Signature;
    contents: T;
    toPOD: () => P & POD.Acknowledged;
    static acknowledge<T extends Acknowledgable, P>(contents: T, acknowledgeKey: PrivateKey, toPOD: (x: T) => P): Acknowledged<T, P>;
    static fromPOD<T extends Acknowledgable, P>(creator: (data: any) => T | Error, toPOD: (x: T) => P, data: any): Acknowledged<T, P> | Error;
    verify(acknowledgementPublicKey: PublicKey): boolean;
    hash(): Hash;
    constructor(contents: T, acknowledgement: Signature, toPOD: (x: T) => P);
}
export declare type Hookin = Acknowledged<_Hookin, POD.Hookin>;
export declare function hookinFromPod(x: any): Hookin | Error;
export declare type FeeBump = Acknowledged<_FeeBump, POD.FeeBump>;
export declare function feeBumpFromPod(x: any): FeeBump | Error;
export declare type LightningPayment = Acknowledged<_LightningPayment, POD.LightningPayment>;
export declare function lightningPaymentFromPod(x: any): LightningPayment | Error;
export declare type LightningInvoice = Acknowledged<_LightningInvoice, POD.LightningInvoice>;
export declare function lightningInvoiceFromPod(x: any): LightningInvoice | Error;
export declare type Hookout = Acknowledged<_Hookout, POD.Hookout>;
export declare function hookoutFromPod(x: any): Hookout | Error;
export declare type Claimable = Acknowledged<_Claimable, POD.Claimable>;
export declare function claimableFromPOD(x: any): Claimable | Error;
export declare type Status = Acknowledged<_Status, POD.Status>;
export declare function statusFromPOD(x: any): Status | Error;
export declare function acknowledge(x: _Status, acknowledgeKey: PrivateKey): Status;
export declare function acknowledge(x: _Claimable, acknowledgeKey: PrivateKey): Claimable;
export {};
