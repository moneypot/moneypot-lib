import * as POD from './pod';
import Hash from './hash';
export default class Hookout {
    static fromPOD(data: any): Hookout | Error;
    amount: POD.Amount;
    bitcoinAddress: string;
    immediate: boolean;
    nonce: Uint8Array;
    constructor(amount: POD.Amount, bitcoinAddress: string, immediate: boolean, nonce: Uint8Array);
    toPOD(): POD.Hookout;
    hash(): Hash;
}
