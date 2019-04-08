import Hash from './hash';
declare type Settable<P> = {
    hash: () => Hash;
    amount: number;
    toPOD: () => P;
};
export default class HSet<T extends Settable<P>, P> {
    static fromPOD<T extends Settable<P>, P>(data: any, fromPOD: (d: any) => T | Error): HSet<T, P> | Error;
    readonly entries: T[];
    constructor(entries: T[]);
    readonly amount: number;
    [Symbol.iterator](): IterableIterator<T>;
    get(n: number): T;
    readonly length: number;
    private canonicalize;
    toPOD(): P[];
    hash(): Hash;
    private isCanonicalized;
}
export {};
