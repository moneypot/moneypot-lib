import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import PublicKey from './public-key';
import AbstractClaimable from './abstract-claimable';
export default abstract class AbstractTransfer implements AbstractClaimable {
    amount: number;
    inputs: Coin[];
    fee: number;
    authorization?: Signature;
    abstract kind: 'LightningPayment' | 'FeeBump' | 'Hookout';
    constructor({ amount, authorization, fee, inputs }: TransferData);
    static sort(hashable: {
        hash(): Hash;
    }[]): void;
    static sortHashes(hashes: Hash[]): void;
    transferHash(): Hash;
    abstract hash(): Hash;
    toPOD(): POD.AbstractTransfer;
    inputAmount(): number;
    readonly claimant: PublicKey;
    isAuthorized(): boolean;
}
export declare function parseTransferData(data: any): TransferData | Error;
export interface TransferData {
    amount: number;
    authorization?: Signature;
    fee: number;
    inputs: Coin[];
}
