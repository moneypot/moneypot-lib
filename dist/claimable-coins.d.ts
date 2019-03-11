import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
export default class ClaimableCoins {
    static fromPOD(data: any): ClaimableCoins | Error;
    amount: number;
    claimant: PublicKey;
    constructor(amount: number, claimant: PublicKey);
    toPOD(): POD.ClaimableCoins;
    hash(): Hash;
}
