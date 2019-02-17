import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
export default class LightningHookin {
    amount: number;
    creditTo: PublicKey;
    invoice: string;
    static fromPOD(data: any): LightningHookin | Error;
    constructor(amount: number, creditTo: PublicKey, invoice: string);
    hash(): Hash;
    toPOD(): POD.LightningHookin;
}
