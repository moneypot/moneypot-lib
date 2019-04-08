import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import HSet from './hset';
import Coin from './coin';
export default class Transfer {
    static fromPOD(data: any): Transfer | Error;
    inputs: HSet<Coin, POD.Coin>;
    bountiesHash: Hash;
    hookoutHash: Hash | undefined;
    authorization: Signature;
    constructor(inputs: HSet<Coin, POD.Coin>, bountiesHash: Hash, hookoutHash: Hash | undefined, authorization: Signature);
    static hashOf(inputs: Hash, bounties: Hash, hookout: Hash | undefined): Hash;
    hash(): Hash;
    toPOD(): POD.Transfer;
    isValid(): boolean;
}
