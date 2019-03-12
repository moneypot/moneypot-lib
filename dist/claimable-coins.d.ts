import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
export default class ClaimableCoins {
    static fromPOD(data: any): ClaimableCoins | Error;
    amount: number;
    claimant: PublicKey;
    nonce: Uint8Array;
    constructor(amount: number, claimant: PublicKey, nonce: Uint8Array);
    toPOD(): POD.ClaimableCoins;
    hash(): Hash;
}
