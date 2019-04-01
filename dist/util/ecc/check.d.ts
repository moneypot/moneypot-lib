import { Point, Scalar, Signature } from '.';
export declare class CheckError extends Error {
    constructor(...args: any[]);
}
export declare function check(assertion: boolean, message: string): void;
export declare function privkeysAreUnique(privkeys: Scalar[]): bigint[];
export declare function isValidPrivkey(privkey: any): privkey is Scalar;
export declare function isValidSignature(sig: any): sig is Signature;
export declare function isValidPubkey(point: any): point is Point;
