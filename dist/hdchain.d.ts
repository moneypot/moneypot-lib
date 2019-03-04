import * as ecc from './util/ecc';
import PublicKey from './public-key';
export default class HDChain {
    getIdentifier(): Uint8Array;
    getFingerprint(): Uint8Array;
    getFingerprintAsNumber(): number;
    readonly privateKeyScalar: bigint | null;
    readonly privateKey: Uint8Array | null;
    readonly publicKeyPoint: ecc.Point;
    readonly publicKey: Uint8Array;
    static fromBase58(str: string, network?: {
        wif: number;
        bip32: {
            public: number;
            private: number;
        };
    }): HDChain;
    static fromPrivateKey(privateKey: Uint8Array, chainCode: Uint8Array, network?: any): HDChain;
    static fromPublicKey(publicKey: Uint8Array, chainCode: Uint8Array, network?: any): HDChain;
    static fromSeed(seed: Uint8Array, network?: any): HDChain;
    __d: Uint8Array | null;
    __Q: Uint8Array | null;
    chainCode: Uint8Array;
    depth: number;
    index: number;
    network: any;
    parentFingerprint: number;
    compressed: boolean;
    constructor(d: Uint8Array | null, Q: Uint8Array | null, chainCode: Uint8Array, network?: {
        wif: number;
        bip32: {
            public: number;
            private: number;
        };
    });
    toPublicKey(): Error | PublicKey;
    isNeutered(): boolean;
    neutered(): HDChain;
    toBase58(): string;
    toWIF(): string;
    derive(index: number): HDChain;
    deriveHardened(index: number): HDChain;
}
