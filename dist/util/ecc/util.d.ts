import { Point, Scalar } from './elliptic';
export declare const curve: {
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
export declare function bufferFromHex(hex: string): Uint8Array | Error;
export declare function bufferToBigInt(bytes: Uint8Array): bigint;
export declare function bufferFromBigInt(n: bigint): Uint8Array;
export declare function concatBuffers(...bufs: Uint8Array[]): Uint8Array;
export declare function pointFromBuffer(buf: Uint8Array): Point | Error;
export declare function pointToBuffer(point: Point): Uint8Array;
export declare function constantTimeBufferEquals(a: Uint8Array, b: Uint8Array): boolean;
export declare function utf8ToBuffer(text: string): Uint8Array;
export declare function isPointOnCurve({ x, y }: Point): boolean;
export declare function jacobi(y: bigint): bigint;
export declare function getK(R: Point, k0: bigint): bigint;
export declare function getK0(privkey: Scalar, message: Uint8Array): Scalar;
export declare function getE(Rx: bigint, P: Point, m: Uint8Array): bigint;
