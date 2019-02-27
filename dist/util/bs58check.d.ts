export declare function encode(payload: Uint8Array): Promise<string>;
export declare function decodeUnsafe(str: string): Promise<Uint8Array | undefined>;
export declare function decode(str: string): Promise<Uint8Array>;
