import Hash from './hash';
import Address from './address';
import * as POD from './pod';
export default class Bounty {
    static fromPOD(data: any): Bounty | Error;
    amount: number;
    claimant: Address;
    nonce: Uint8Array;
    constructor(amount: number, claimant: Address, nonce: Uint8Array);
    toPOD(): POD.Bounty;
    hash(): Hash;
}
