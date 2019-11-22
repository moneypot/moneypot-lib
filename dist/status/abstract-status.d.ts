import Hash from '../hash';
export default abstract class AbstractStatus {
    claimableHash: Hash;
    constructor(claimableHash: Hash);
    get buffer(): Uint8Array;
    abstract hash(): Hash;
    abstract toPOD(): {
        claimableHash: string;
    };
}
