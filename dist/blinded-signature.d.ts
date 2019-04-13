import * as ecc from './util/ecc';
export default class BlindedSignature {
    static fromPOD(data: any): Error | BlindedSignature;
    static fromBytes(bytes: Uint8Array): BlindedSignature | Error;
    s: ecc.Scalar;
    constructor(s: ecc.Scalar);
    readonly buffer: Uint8Array;
    toPOD(): string;
}
