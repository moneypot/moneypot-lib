export declare function decodeRaw(buffer: Uint8Array, version: number): {
    version: number;
    privateKey: Uint8Array;
    compressed: boolean;
};
export declare function encodeRaw(version: number, privateKey: Uint8Array, compressed?: boolean): Uint8Array;
export declare function decode(str: string, version: number): Promise<{
    version: number;
    privateKey: Uint8Array;
    compressed: boolean;
}>;
export declare function encode(version: number, privateKey: Uint8Array, compressed?: boolean): Promise<string>;
