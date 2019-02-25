/// <reference types="node" />
export declare function encode(source: Uint8Array): string;
export declare function decodeUnsafe(source: string): Buffer | undefined;
export declare function decode(str: string): Buffer;
