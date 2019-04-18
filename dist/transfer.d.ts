import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
export default class Transfer {
    static fromPOD(data: any): Transfer | Error;
    readonly inputs: ReadonlyArray<Coin>;
    readonly outputHash: Hash;
    readonly changeHash: Hash;
    authorization: Signature;
    constructor(inputs: ReadonlyArray<Coin>, outputHash: Hash, changeHash: Hash, authorization: Signature);
    static sort(hashable: {
        hash(): Hash;
    }[]): void;
    static sortHashes(hashes: Hash[]): void;
    static hashOf(inputs: ReadonlyArray<Hash>, output: Hash, change: Hash): Hash;
    hash(): Hash;
    toPOD(): POD.Transfer;
    isValid(): boolean;
}
