import * as ecc from './util/ecc';
import PublicKey from './public-key';
export default class PrivateKey {
    static fromPOD(data: any): PrivateKey | Error;
    static fromBytes(bytes: Uint8Array): PrivateKey | Error;
    static fromRand(): PrivateKey;
    scalar: ecc.Scalar;
    private constructor();
    readonly buffer: Uint8Array;
    toPOD(): string;
    toPublicKey(): PublicKey;
    tweak(n: PrivateKey): PrivateKey;
    toWif(testnet?: boolean): string;
    derive(n: Uint8Array): PrivateKey;
}
