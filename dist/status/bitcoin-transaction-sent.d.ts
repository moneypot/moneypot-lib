import AbstractStatus from './abstract-status';
import Hash from '../hash';
import { POD } from '..';
export default class BitcoinTransactionSent extends AbstractStatus {
    txid: Uint8Array;
    vout: number;
    constructor(claimableHash: Uint8Array, txid: Uint8Array, vout: number);
    hash(): Hash;
    toPOD(): POD.Status.BitcoinTransactionSent;
    static fromPOD(obj: any): BitcoinTransactionSent | Error;
}
