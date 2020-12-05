import * as ecc from './util/ecc';
export default class BlindedSignature {
    static fromPOD(data: any): Error | BlindedSignature;
    static fromBytes(bytes: Uint8Array): BlindedSignature | Error;
    s: ecc.Scalar;
    constructor(s: ecc.Scalar);
    verify(nonce: ecc.Point, message: bigint, signer: ecc.Point): boolean;
    get buffer(): Uint8Array;
    toPOD(): string;
}
