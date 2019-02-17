import PublicKey from './public-key';
export default class Address {
    static fromBech(serialized: string): Error | PublicKey;
    publicKey: PublicKey;
    constructor(pub: PublicKey);
    toBech(): string;
}
