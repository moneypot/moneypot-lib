export declare type Scalar = bigint;
export declare const Scalar: {
    fromBytes(buf: Uint8Array): bigint | Error;
    fromHex(hex: string): bigint | Error;
    toBytes(n: bigint): Uint8Array;
    toHex(n: bigint): string;
};
export interface Point {
    readonly x: bigint;
    readonly y: bigint;
}
export declare const Point: {
    fromPrivKey(privkey: bigint): Point;
    fromBytes(buf: Uint8Array): Error | Point;
    fromHex(hex: string): Error | Point;
    toHex(point: Point): string;
    toBytes(point: Point): Uint8Array;
};
export declare const INFINITE_POINT: Point;
export declare function scalarAdd(a: Scalar, b: Scalar): Scalar;
export declare function scalarMultiply(a: Scalar, b: Scalar): Scalar;
export declare function scalarNegate(a: Scalar): Scalar;
export declare function scalarInverse(a: Scalar): Scalar;
export declare function pointEq(a: Point, b: Point): boolean;
export declare function pointAdd(...points: Point[]): Point;
export declare function pointSubtract(a: Point, b: Point): Point;
export declare function pointMultiply(point: Point, scalar: bigint): Point;
export declare function naiveMultiply(point: Point, scalar: bigint): Point;
