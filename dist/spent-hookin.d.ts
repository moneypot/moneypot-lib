import Signature from './signature';
import Hookin from './hookin';
import * as POD from './pod';
export default class SpentHookin {
    static fromPOD(data: any): SpentHookin | Error;
    hookin: Hookin;
    spendAuthorization: Signature;
    constructor(hookin: Hookin, spendAuthorization: Signature);
    readonly amount: number;
    hash(): Promise<import("./hash").default>;
    toPOD(): POD.SpentHookin;
}
