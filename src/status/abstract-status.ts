import Hash from '../hash';

export default abstract class AbstractStatus {
  claimableHash: Hash;

  constructor(claimableHash: Hash) {
    this.claimableHash = claimableHash;
  }
  get buffer(): Uint8Array {
    return this.claimableHash.buffer;
  }
  abstract hash(): Hash; // Make sure to include  super.buffer !
  abstract toPOD(): { claimableHash: string };
}
