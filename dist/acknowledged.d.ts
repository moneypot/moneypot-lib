import Signature from './signature';
import Hash from './hash';
import PrivateKey from './private-key';
import * as POD from './pod';
interface Acknowledgable<P> {
    hash(): Hash;
    toPOD(): P;
}
export default class Acknowledged<T extends Acknowledgable<P>, P> {
    acknowledgement: Signature;
    contents: T;
    static acknowledge<T extends Acknowledgable<P>, P>(contents: T, acknowledgeKey: PrivateKey): Acknowledged<T, P>;
    static fromPOD<T extends Acknowledgable<P>, P>(creator: (data: any) => T | Error, data: any): Acknowledged<T, P>;
    hash(): Hash;
    constructor(contents: T, acknowledgement: Signature);
    toPOD(): POD.Acknowledged & P;
}
export {};
