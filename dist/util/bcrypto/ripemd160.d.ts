import HMAC from './hmac';
export default class RIPEMD160 {
    state: Uint32Array;
    msg: Uint32Array;
    block: Uint8Array;
    size: number;
    constructor();
    init(): this;
    update(data: Uint8Array): this;
    final(): Uint8Array;
    _update(data: Uint8Array, len: number): void;
    /**
     * Finalize RIPEMD160 context.
     * @private
     * @param {Buffer} out
     * @returns {Buffer}
     */
    private _final;
    transform(chunk: Uint8Array, pos: number): void;
    static hash(): RIPEMD160;
    static hmac(): HMAC;
    static digest(...data: Uint8Array[]): Uint8Array;
    static mac(key: Uint8Array, data: Uint8Array): Uint8Array;
}
