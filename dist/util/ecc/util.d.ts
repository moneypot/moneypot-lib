import { Point } from './elliptic';
export declare const secp256k1: {
    a: bigint;
    b: bigint;
    p: bigint;
    g: {
        x: bigint;
        y: bigint;
    };
    n: bigint;
};
export declare function mod(a: bigint, b: bigint): bigint;
export declare function powmod(base: bigint, exp: bigint, m: bigint): bigint;
export declare function modInverse(a: bigint, m: bigint): bigint;
export declare function bufferToHex(buf: Uint8Array): string;
export declare function bufferFromHex(hex: string): Uint8Array;
export declare function bufferToBigInt(bytes: Uint8Array): bigint;
export declare function bufferFromBigInt(n: bigint): Uint8Array;
export declare function concatBuffers(...buffs: Uint8Array[]): Uint8Array;
export declare function pointFromBuffer(buf: Uint8Array): Point | Error;
export declare function pointToBuffer(point: Point): Uint8Array;
export declare function constantTimeBufferEquals(a: Uint8Array, b: Uint8Array): boolean;
export declare function utf8ToBuffer(text: string): Uint8Array;
export declare function isPointOnCurve({ x, y }: Point): boolean;
export declare function jacobi(y: bigint): bigint;
