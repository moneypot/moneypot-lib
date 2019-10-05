import * as ecc from './util/ecc';
import PublicKey from './public-key';
export default class PrivateKey {
    static fromPOD(data: any): PrivateKey | Error;
    static fromBytes(bytes: Uint8Array): PrivateKey | Error;
    static fromRand(): PrivateKey;
    static combine(privkeys: PrivateKey[]): PrivateKey;
    scalar: ecc.Scalar;
    constructor(scalar: ecc.Scalar);
    readonly buffer: Uint8Array;
    toPOD(): string;
    toPublicKey(): PublicKey;
    tweak(n: PrivateKey): PrivateKey;
    toWif(testnet?: boolean): string;
    derive(n: Uint8Array | number | bigint): PrivateKey;
}
