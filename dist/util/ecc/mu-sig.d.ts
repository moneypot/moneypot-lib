import { Point, Scalar, Signature } from '.';
export declare function pubkeyCombine(pubkeys: Point[]): Point;
export declare function privkeyCombine(privkeys: Scalar[]): Scalar;
export declare function signNoninteractively(privkeys: Scalar[], message: Uint8Array): Signature;
