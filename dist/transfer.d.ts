import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import Change from './change';
export default class Transfer {
    static fromPOD(data: any): Transfer | Error;
    readonly inputs: ReadonlyArray<Coin>;
    readonly outputHash: Hash;
    readonly change: Change;
    authorization: Signature;
    constructor(inputs: ReadonlyArray<Coin>, outputHash: Hash, change: Change, authorization: Signature);
    static sort(hashable: {
        hash(): Hash;
    }[]): void;
    static sortHashes(hashes: Hash[]): void;
    static hashOf(inputs: ReadonlyArray<Hash>, output: Hash, change: Change): Hash;
    hash(): Hash;
    toPOD(): POD.Transfer;
    inputAmount(): number;
    isAuthorized(): boolean;
}
