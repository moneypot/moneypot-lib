import HMAC from './hmac';
/**
 * SHA256
 */
export default class SHA256 {
    state: Uint32Array;
    msg: Uint32Array;
    block: Uint8Array;
    size: number;
    constructor();
    init(): this;
    update(data: Uint8Array): this;
    final(): Uint8Array;
    private _update;
    private _final;
    transform(chunk: Uint8Array, pos: number): void;
    static hash(): SHA256;
    static hmac(): HMAC;
    static digest(...data: Uint8Array[]): Uint8Array;
    static mac(key: Uint8Array, data: Uint8Array): Uint8Array;
}
