import { Point } from '.';
export interface Signature {
    r: bigint;
    s: bigint;
}
export declare const Signature: {
    fromBytes(buf: Uint8Array): Signature;
    toBytes({ r, s }: Signature): Uint8Array;
    toHex(sig: Signature): string;
};
export declare function sign(message: Uint8Array, secret: bigint): Signature;
export declare function verify(pubkey: Point, message: Uint8Array, sig: Signature): Promise<boolean>;
