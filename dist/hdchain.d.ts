import * as ecc from './util/ecc';
import PublicKey from './public-key';
export default class HDChain {
    getIdentifier(): Promise<Uint8Array>;
    getFingerprint(): Promise<Uint8Array>;
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
    }): Promise<HDChain>;
    static fromPrivateKey(privateKey: Uint8Array, chainCode: Uint8Array, network?: any): HDChain;
    static fromPublicKey(publicKey: Uint8Array, chainCode: Uint8Array, network?: any): HDChain;
    static fromSeed(seed: Uint8Array, network?: any): Promise<HDChain>;
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
    toBase58(): Promise<string>;
    toWIF(): Promise<string>;
    derive(index: number): Promise<HDChain>;
    deriveHardened(index: number): Promise<HDChain>;
}
