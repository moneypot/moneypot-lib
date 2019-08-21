import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
export default class Failed extends AbstractStatus {
    reason: string;
    rebate: number;
    constructor(claimableHash: Uint8Array, reason: string, rebate: number);
    hash(): Hash;
    toPOD(): POD.Status.Failed;
    static fromPOD(obj: any): Failed | Error;
}
