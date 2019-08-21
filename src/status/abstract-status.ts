import Hash from '../hash';

export default abstract class AbstractStatus {
  claimableHash: Uint8Array;

  constructor(claimableHash: Uint8Array) {
    this.claimableHash = claimableHash;
  }
  get buffer() {
    return this.claimableHash;
  }
  abstract hash(): Hash; // Make sure to include  super.buffer !
  abstract toPOD(): { claimableHash: string };
}
