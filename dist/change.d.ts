import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
export default class Change {
    static fromPOD(data: any): Change | Error;
    amount: number;
    claimant: PublicKey;
    constructor(amount: number, claimant: PublicKey);
    toPOD(): POD.Change;
    readonly buffer: Uint8Array;
    hash(): Hash;
}
