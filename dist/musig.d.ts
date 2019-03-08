import * as ecc from './util/ecc';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
export default class MuSig {
    static computeEll(pubKeys: ecc.Point[]): Uint8Array;
    static computeCoefficient(ell: Uint8Array, idx: number): bigint;
    static sign(privateKeys: PrivateKey[], message: Uint8Array): Signature;
    static combinePublicKeys(publicKeys: PublicKey[]): PublicKey;
}
