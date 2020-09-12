import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
export default class HookinAccepted extends AbstractStatus {
    consolidationFee: number;
    adversaryFee?: number;
    constructor(claimableHash: Hash, consolidationFee: number, adversaryFee?: number);
    hash(): Hash;
    toPOD(): POD.Status.HookinAccepted;
    static fromPOD(data: any): HookinAccepted | Error;
}
