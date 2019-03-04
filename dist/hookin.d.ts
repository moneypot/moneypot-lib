import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as POD from './pod';
export default class Hookin {
    static fromPOD(data: any): Hookin | Error;
    static hashOf(txid: Uint8Array, vout: number, amount: number, creditTo: PublicKey, deriveIndex: number): Hash;
    txid: Uint8Array;
    vout: number;
    amount: number;
    creditTo: PublicKey;
    deriveIndex: number;
    constructor(txid: Uint8Array, vout: number, amount: number, creditTo: PublicKey, deriveIndex: number);
    hash(): Hash;
    getTweak(): PrivateKey;
    toPOD(): POD.Hookin;
}
