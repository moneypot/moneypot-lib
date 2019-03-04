import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import Signature from './signature';
export default class ClaimedCoin {
    static fromPOD(data: any): ClaimedCoin | Error;
    owner: PublicKey;
    magnitude: POD.Magnitude;
    existenceProof: Signature;
    constructor(owner: PublicKey, magnitude: POD.Magnitude, existenceProof: Signature);
    hash(): Hash;
    toPOD(): POD.ClaimedCoin;
}
