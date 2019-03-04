import { Point } from './elliptic';
import { Signature } from './signature';
export interface BlindedMessage {
    c: bigint;
}
export interface Unblinder {
    alpha: bigint;
    r: bigint;
}
export interface BlindedSignature {
    s: bigint;
}
export declare function blindMessage(secret: Uint8Array, nonce: Point, signer: Point, message: Uint8Array): [Unblinder, BlindedMessage];
export declare function blindSign(signer: bigint, nonce: bigint, { c }: BlindedMessage): BlindedSignature;
export declare function unblind({ alpha, r }: Unblinder, blindedSig: BlindedSignature): Signature;
