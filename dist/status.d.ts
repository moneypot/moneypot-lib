import * as POD from './pod';
import Hash from './hash';
export default class Status {
    s: POD.Status;
    static fromPOD(x: any): Error | Status;
    constructor(s: POD.Status);
    toPOD(): POD.Status;
    hash(): Hash;
    private stringify;
}
