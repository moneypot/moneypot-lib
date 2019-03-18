import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import Signature from './signature';
export default class Coin {
    static fromPOD(data: any): Coin | Error;
    owner: PublicKey;
    magnitude: POD.Magnitude;
    existenceProof: Signature;
    constructor(owner: PublicKey, magnitude: POD.Magnitude, existenceProof: Signature);
    hash(): Hash;
    toPOD(): POD.Coin;
}
