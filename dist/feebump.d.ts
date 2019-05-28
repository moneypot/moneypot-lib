import * as POD from './pod';
import Hash from './hash';
export default class FeeBump {
    static fromPOD(data: any): FeeBump | Error;
    totalFee: POD.Amount;
    txid: Uint8Array;
    nonce: Uint8Array;
    constructor(totalFee: POD.Amount, txid: Uint8Array, nonce: Uint8Array);
    toPOD(): POD.FeeBump;
    hash(): Hash;
}
