import HMAC from './hmac';
export default class SHA512 {
    state: Uint32Array;
    msg: Uint32Array;
    block: Uint8Array;
    size: number;
    constructor();
    /**
     * Initialize SHA512 context.
     */
    init(): this;
    update(data: Uint8Array): this;
    final(): Uint8Array;
    _update(data: Uint8Array, len: number): void;
    private _final;
    prepare(chunk: Uint8Array, pos: number): void;
    transform(chunk: Uint8Array, pos: number): void;
    static hash(): SHA512;
    static hmac(): HMAC;
    static digest(...data: Uint8Array[]): Uint8Array;
    static mac(key: Uint8Array, data: Uint8Array): Uint8Array;
}
