import Hash from '../hash';
export default abstract class AbstractStatus {
    claimableHash: Uint8Array;
    constructor(claimableHash: Uint8Array);
    readonly buffer: Uint8Array;
    abstract hash(): Hash;
    abstract toPOD(): {
        claimableHash: string;
    };
}
