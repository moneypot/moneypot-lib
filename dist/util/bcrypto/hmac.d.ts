interface HashType {
    init(): void;
    update(key: Uint8Array): void;
    final(): Uint8Array;
}
declare type HashCtor = () => HashType;
export default class HMAC {
    hash: HashCtor;
    size: number;
    inner: HashType;
    outer: HashType;
    constructor(Hash: HashCtor, size: number, x?: never[], y?: never[]);
    init(key: Uint8Array): this;
    update(data: Uint8Array): this;
    final(): Uint8Array;
}
export {};
