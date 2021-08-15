import { Point, Scalar } from '.';
import { PrivateKey, PublicKey } from '../..';
import { Signature } from './signature';
export declare function calculateL(pubkeys: Point[]): Uint8Array;
export declare function bipCalculateL(pubKeys: Uint8Array[]): Uint8Array;
export declare function pubkeyCombine(pubkeys: Point[]): Point;
export declare function bipPubkeyCombine(pubkeys: Point[]): Point;
export declare function privkeyCombine(privkeys: Scalar[]): Scalar;
export declare function calculateCoefficient(L: Uint8Array, idx: number): bigint;
export declare function sessionInit(sessionID: Uint8Array, privateKey: PrivateKey, message: Uint8Array, pubKeyCombined: Uint8Array, pkParity: any, ell: Uint8Array, idx: number): {
    session: {
        sessionID: Uint8Array;
        message: Uint8Array;
        pubKeyCombined: Uint8Array;
        pkParity: any;
        ell: Uint8Array;
        idx: number;
    };
    nonce: bigint;
    nonceParity: boolean;
    commitment: Uint8Array;
    privKeyNonce: PrivateKey;
    ownKeyParity: boolean;
    secretSessionKey: bigint;
};
export declare function sessionNonceCombine(nonces: PublicKey[]): {
    combinedNonceParity: boolean;
    R: PublicKey;
};
export declare function partialSign(message: Uint8Array, nonceCombined: PublicKey, pubKeyCombined: PublicKey, secretNonce: PrivateKey, secretKey: PrivateKey, nonceParity: boolean, combinedNonceParity: boolean): bigint;
export declare function partialSignbipPlusbipGetE(message: Uint8Array, nonceCombined: PublicKey, pubKeyCombined: PublicKey, secretNonce: PrivateKey, secretKey: PrivateKey, nonceParity: boolean, combinedNonceParity: boolean): bigint;
export declare function partialSigbipVerify(message: Uint8Array, pubKeyCombined: bigint, partialSig: bigint, nonceCombined: PublicKey, idx: number, pubKey: PublicKey, nonce: PublicKey, ell: Uint8Array, pkParity: boolean, combinedNonceParity: boolean): boolean;
export declare function partialSigCombine(nonceCombined: PublicKey, partialSigs: bigint[]): Signature;
