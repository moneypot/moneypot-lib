import * as ecc from './util/ecc/index';
export default class BlindedMessage {
    static fromPOD(data: any): BlindedMessage | Error;
    static fromBytes(bytes: Uint8Array): BlindedMessage | Error;
    c: ecc.Scalar;
    constructor(challenge: ecc.Scalar);
    get buffer(): Uint8Array;
    toPOD(): string;
}
