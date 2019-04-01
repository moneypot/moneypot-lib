import Hash from './hash';
import Signature from './signature';
import CoinSet from './coin-set';
import * as POD from './pod';
export default class Transfer {
    static fromPOD(data: any): Transfer | Error;
    input: CoinSet;
    output: Hash;
    authorization: Signature;
    constructor(input: CoinSet, output: Hash, authorization: Signature);
    static hashOf(input: Hash, output: Hash): Hash;
    hash(): Hash;
    toPOD(): POD.Transfer;
    isValid(): boolean;
}
