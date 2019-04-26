import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
export default class CustodianInfo {
    acknowledgementKey: PublicKey;
    currency: string;
    fundingKey: PublicKey;
    blindCoinKeys: PublicKey[];
    constructor(acknowledgementKey: PublicKey, currency: string, fundingKey: PublicKey, blindCoinKeys: PublicKey[]);
    hash(): Hash;
    toPOD(): POD.Custodian;
    static fromPOD(d: any): CustodianInfo | Error;
}
