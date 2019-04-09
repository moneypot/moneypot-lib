import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
export default class Transfer {
    static fromPOD(data: any): Transfer | Error;
    readonly inputs: ReadonlyArray<Coin>;
    readonly bountyHashes: ReadonlyArray<Hash>;
    readonly hookoutHash: Hash | undefined;
    authorization: Signature;
    constructor(inputs: ReadonlyArray<Coin>, bountyHashes: ReadonlyArray<Hash>, hookoutHash: Hash | undefined, authorization: Signature);
    static hashOf(inputs: ReadonlyArray<Hash>, bounties: ReadonlyArray<Hash>, hookout: Hash | undefined): Hash;
    hash(): Hash;
    toPOD(): POD.Transfer;
    isValid(): boolean;
}
