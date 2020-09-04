import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
export default class CustodianInfo {
    acknowledgementKey: PublicKey;
    currency: string;
    fundingKey: PublicKey;
    blindCoinKeys: PublicKey[];
    wipeDate?: string;
    wipeDateSig?: POD.Signature;
    constructor(acknowledgementKey: PublicKey, currency: string, fundingKey: PublicKey, blindCoinKeys: PublicKey[], wipeDate?: string, wipeDateSig?: POD.Signature);
    hash(): Hash;
    prefix(): string;
    toPOD(): POD.CustodianInfo;
    static fromPOD(d: any): CustodianInfo | Error;
}
