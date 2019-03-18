import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import Signature from './signature';
import Magnitude from './magnitude';
export default class Coin {
    static fromPOD(data: any): Coin | Error;
    owner: PublicKey;
    magnitude: Magnitude;
    existenceProof: Signature;
    constructor(owner: PublicKey, magnitude: Magnitude, existenceProof: Signature);
    hash(): Hash;
    toPOD(): POD.Coin;
}
