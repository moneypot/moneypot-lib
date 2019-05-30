import * as ecc from './util/ecc';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Hash from './hash';
export default class Signature {
    static compute(message: Hash, privkey: PrivateKey): Signature;
    static computeMu(message: Hash, privkeys: PrivateKey[]): Signature;
    static fromPOD(data: any): Signature | Error;
    static fromBytes(bytes: Uint8Array): Signature | Error;
    r: ecc.Scalar;
    s: ecc.Scalar;
    constructor(r: ecc.Scalar, s: ecc.Scalar);
    readonly buffer: Uint8Array;
    verify(message: Hash, pubkey: PublicKey): boolean;
    toPOD(): string;
}
