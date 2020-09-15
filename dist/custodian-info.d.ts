import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
export default class CustodianInfo {
    acknowledgementKey: PublicKey;
    currency: string;
    fundingKey: PublicKey;
    blindCoinKeys: PublicKey[];
    wipeDate?: string;
    constructor(acknowledgementKey: PublicKey, currency: string, fundingKey: PublicKey, blindCoinKeys: PublicKey[], wipeDate?: string);
    hash(): Hash;
    prefix(): string;
    toPOD(): POD.CustodianInfo;
    static fromPOD(d: any): CustodianInfo | Error;
}
