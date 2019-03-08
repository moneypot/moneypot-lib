import Hash from './hash';
import * as POD from './pod';
export default class Transfer {
    static fromPOD(d: any): Transfer | Error;
    input: Hash;
    output: Hash;
    constructor(input: Hash, output: Hash);
    static hashOf(input: Hash, output: Hash): Hash;
    hash(): Hash;
    toPOD(): POD.Transfer;
}
