import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
export default class Change {
    static fromPOD(data: any): Change | Error;
    amount: number;
    claimant: PublicKey;
    nonce: Uint8Array;
    constructor(amount: number, claimant: PublicKey, nonce: Uint8Array);
    toPOD(): POD.Change;
    readonly buffer: Uint8Array;
    hash(): Hash;
}
