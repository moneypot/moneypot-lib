import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import PublicKey from './public-key';
import AbstractClaimable from './abstract-claimable';
import PrivateKey from './private-key';
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
    static transferHash(td: TransferData): Hash;
    abstract hash(): Hash;
    toPOD(): POD.AbstractTransfer;
    readonly claimableAmount: number;
    inputAmount(): number;
    readonly claimant: PublicKey;
    isAuthorized(): boolean;
    authorize(inputPrivateKeys: PrivateKey[]): void;
}
export declare function parseTransferData(data: any): TransferData | Error;
export interface TransferData {
    amount: number;
    authorization?: Signature;
    fee: number;
    inputs: Coin[];
}
