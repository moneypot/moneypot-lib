import Hash from './hash';
import * as POD from './pod';
export default class LightningHookout {
    static fromPOD(data: any): LightningHookout | Error;
    invoice: string;
    amount: number;
    constructor(invoice: string, amount: number);
    hash(): Hash;
    toPOD(): POD.LightningHookout;
}
