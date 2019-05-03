import Hash from './hash';
import PublicKey from './public-key';
export default class Address {
    custodianPrefix: string;
    publicKey: PublicKey;
    constructor(custodianPrefix: string, publicKey: PublicKey);
    static fromPOD(data: any): Address | Error;
    readonly buffer: Uint8Array;
    toPOD(): string;
    hash(): Hash;
}
