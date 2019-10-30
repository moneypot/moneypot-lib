export declare function toBase58Check(hash: Uint8Array, version: number): string;
export declare function toBech32(data: Uint8Array, version: number, prefix: string): string;
declare type AddressKind = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh';
export declare function decodeBitcoinAddress(address: string): {
    kind: AddressKind;
    network: 'mainnet' | 'testnet';
} | Error;
export {};
