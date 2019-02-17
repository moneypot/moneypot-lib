import PublicKey from './public-key';
import * as POD from './pod';
import Hash from './hash';
export default class ClaimableCoin {
    static fromPOD(data: any): ClaimableCoin | Error;
    claimant: PublicKey;
    magnitude: number;
    constructor(claimant: PublicKey, magnitude: POD.Magnitude);
    hash(): Hash;
    toPOD(): POD.ClaimableCoin;
}
