import * as ecc from './util/ecc';
import PrivateKey from './private-key';
import PublicKey from './public-key';
export default class Signature {
    static compute(message: Uint8Array, privkey: PrivateKey): Promise<Signature>;
    static fromBech(serialized: string): Error | Signature;
    static fromBytes(bytes: Uint8Array): Signature | Error;
    r: ecc.Scalar;
    s: ecc.Scalar;
    constructor(r: ecc.Scalar, s: ecc.Scalar);
    readonly buffer: Uint8Array;
    verify(message: Uint8Array, pubkey: PublicKey): Promise<boolean>;
    toBech(): string;
}