import PublicKey from './public-key';
import Hash from './hash';
import * as POD from './pod';
export default class Custodian {
    acknowledgementKey: PublicKey;
    fundingKey: PublicKey;
    blindCoinKeys: PublicKey[];
    constructor(acknowledgementKey: PublicKey, fundingKey: PublicKey, blindCoinKeys: PublicKey[]);
    hash(): Hash;
    toPOD(): POD.Custodian;
    static fromPOD(d: any): Custodian | Error;
}
