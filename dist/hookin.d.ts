import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as POD from './pod';
export default class Hookin {
    static fromPOD(data: any): Hookin | Error;
    static hashOf(txid: Uint8Array, vout: number, amount: number, claimant: PublicKey): Hash;
    txid: Uint8Array;
    vout: number;
    amount: number;
    claimant: PublicKey;
    constructor(txid: Uint8Array, vout: number, amount: number, claimant: PublicKey);
    hash(): Hash;
    getTweak(): PrivateKey;
    toPOD(): POD.Hookin;
}
