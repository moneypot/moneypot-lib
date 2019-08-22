import AbstractStatus from './abstract-status';
import Hash from '../hash';
import * as POD from '../pod';
export default class BitcoinTransactionSent extends AbstractStatus {
    txid: Uint8Array;
    vout: number;
    constructor(claimableHash: Hash, txid: Uint8Array, vout: number);
    hash(): Hash;
    toPOD(): POD.Status.BitcoinTransactionSent;
    static fromPOD(obj: any): BitcoinTransactionSent | Error;
}
