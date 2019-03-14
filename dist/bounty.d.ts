import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
export default class Bounty {
    static fromPOD(data: any): Bounty | Error;
    amount: number;
    claimant: PublicKey;
    nonce: Uint8Array;
    constructor(amount: number, claimant: PublicKey, nonce: Uint8Array);
    toPOD(): POD.Bounty;
    hash(): Hash;
}
