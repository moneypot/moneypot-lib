import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import * as POD from './pod';
import { PublicKey } from '.';
import _ClaimResponse from './claim-response';
import _Hookout from './hookout';
import _FeeBump from './fee-bump';
import _LightningPayment from './lightning-payment';
import _LightningInvoice from './lightning-invoice';
import _Hookin from './hookin';
interface Acknowledgable<P> {
    hash(): Hash;
    toPOD(): P;
}
export default class Acknowledged<T extends Acknowledgable<P>, P> {
    acknowledgement: Signature;
    contents: T;
    static acknowledge<T extends Acknowledgable<P>, P>(contents: T, acknowledgeKey: PrivateKey): Acknowledged<T, P>;
    static fromPOD<T extends Acknowledgable<P>, P>(creator: (data: any) => T | Error, data: any): Acknowledged<T, P> | Error;
    verify(acknowledgementPublicKey: PublicKey): boolean;
    hash(): Hash;
    constructor(contents: T, acknowledgement: Signature);
    toPOD(): POD.Acknowledged & P;
}
export declare type ClaimResponse = Acknowledged<_ClaimResponse, POD.ClaimResponse>;
export declare function claimResponse(x: any): ClaimResponse | Error;
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
export declare function acknowledge(x: _ClaimResponse, acknowledgeKey: PrivateKey): ClaimResponse;
export declare function acknowledge(x: _Hookin, acknowledgeKey: PrivateKey): Hookin;
export declare function acknowledge(x: _Hookout, acknowledgeKey: PrivateKey): Hookout;
export declare function acknowledge(x: _LightningPayment, acknowledgeKey: PrivateKey): LightningPayment;
export declare function acknowledge(x: _LightningInvoice, acknowledgeKey: PrivateKey): LightningInvoice;
export declare function acknowledge(x: _FeeBump, acknowledgeKey: PrivateKey): FeeBump;
export {};
