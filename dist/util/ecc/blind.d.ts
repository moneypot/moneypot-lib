import { Point } from './elliptic';
import { Signature } from './signature';
export declare type BlindedMessage = {
    c: bigint;
};
export declare type Unblinder = {
    alpha: bigint;
    r: bigint;
};
export declare type BlindedSignature = {
    s: bigint;
};
export declare function blindMessage(secret: Uint8Array, nonce: Point, signer: Point, message: Uint8Array): [Unblinder, BlindedMessage];
export declare function blindSign(signer: bigint, nonce: bigint, { c }: BlindedMessage): BlindedSignature;
export declare function unblind({ alpha, r }: Unblinder, blindedSig: BlindedSignature): Signature;
export declare function blindVerify(blindedSig: bigint, nonce: Point, message: bigint, signer: Point): boolean;
