import * as ecc from './util/ecc/index';
export default class BlindedMessage {
    static fromBech(str: string): Error | BlindedMessage;
    static fromBytes(bytes: Uint8Array): BlindedMessage | Error;
    c: ecc.Scalar;
    constructor(challenge: ecc.Scalar);
    readonly buffer: Uint8Array;
    toBech(): string;
}
