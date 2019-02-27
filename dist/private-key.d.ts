import * as ecc from './util/ecc';
import PublicKey from './public-key';
export default class PrivateKey {
    static fromBech(str: string): Error | PrivateKey;
    static fromBytes(bytes: Uint8Array): PrivateKey | Error;
    static fromRand(): PrivateKey;
    scalar: ecc.Scalar;
    private constructor();
    readonly buffer: Uint8Array;
    toBech(): string;
    toPublicKey(): PublicKey;
    tweak(n: PrivateKey): PrivateKey;
    toWif(testnet?: boolean): Promise<string>;
    derive(n: Uint8Array): Promise<PrivateKey>;
}
