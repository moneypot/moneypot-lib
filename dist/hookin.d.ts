import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as POD from './pod';
import AbstractClaimable from './abstract-claimable';
export default class Hookin implements AbstractClaimable {
    static fromPOD(data: any): Hookin | Error;
    static hashOf(txid: Uint8Array, vout: number, amount: number, fee: number, claimant: PublicKey): Hash;
    txid: Uint8Array;
    vout: number;
    amount: number;
    fee: number;
    claimant: PublicKey;
    constructor(txid: Uint8Array, vout: number, amount: number, fee: number, claimant: PublicKey);
    hash(): Hash;
    readonly kind: 'Hookin';
    getTweak(): PrivateKey;
    toPOD(): POD.Hookin;
}
