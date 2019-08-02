import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import Coin from './coin';
import PublicKey from './public-key';
export default abstract class Abstract {
    amount: number;
    inputs: Coin[];
    claimant: PublicKey;
    fee: number;
    authorization?: Signature;
    abstract kind: 'LightningPayment' | 'FeeBump' | 'Hookout';
    constructor({ amount, authorization, claimant, fee, inputs }: TransferData);
    static sort(hashable: {
        hash(): Hash;
    }[]): void;
    static sortHashes(hashes: Hash[]): void;
    transferHash(): Hash;
    abstract hash(): Hash;
    transferPOD(): {
        amount: number;
        authorization: string | null;
        claimant: string;
        fee: number;
        inputs: POD.Coin[];
    };
    abstract toPOD(): POD.AbstractTransfer;
    inputAmount(): number;
    isAuthorized(): boolean;
}
export declare function parseTransferData(data: any): TransferData | Error;
export interface TransferData {
    amount: number;
    authorization?: Signature;
    claimant: PublicKey;
    fee: number;
    inputs: Coin[];
}
