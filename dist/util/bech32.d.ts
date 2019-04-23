export declare const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
export declare function polymodStep(pre: number): number;
export declare function prefixChk(prefix: string): number;
export declare function encode(prefix: string, words: Uint8Array): string;
export declare function decode(str: string): {
    prefix: string;
    words: number[];
};
export declare function convert(data: Uint8Array | number[], inBits: number, outBits: number, pad: boolean): Uint8Array;
export declare function toWords(bytes: Uint8Array): Uint8Array;
export declare function fromWords(words: Uint8Array | number[]): Uint8Array;
