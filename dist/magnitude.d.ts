import * as POD from './pod';
export default class Magnitude {
    static MaxMagnitude: number;
    static fromPOD(d: any): Error | Magnitude;
    readonly n: number;
    constructor(n: number);
    toAmount(): number;
    readonly buffer: Uint8Array;
    toPOD(): POD.Magnitude;
}
