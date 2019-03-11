import BlindedSignature from './blinded-signature';
import Hash from './hash';
import * as POD from './pod';



export default class ClaimResponse {
  public static fromPOD(data: any): ClaimResponse | Error {
    if (typeof data !== 'object') {
      throw new Error('ClaimResponse must be an object');
    }

    const claimRequest = Hash.fromBech(data.claimRequestHash);
    if (claimRequest instanceof Error) {
      return claimRequest;
    }

    if (!Array.isArray(data.blindedExistenceProofs)) {
      return new Error('expected blindedExistenceProofs in ClaimResponse to be an array');
    }

    const blindedExistenceProofs:  BlindedSignature[] = [];
    for (const bep of data.blindedExistenceProofs) {

      const blindedExistenceProof = BlindedSignature.fromBech(bep);
      if (blindedExistenceProof instanceof Error) {
        return blindedExistenceProof;
      }

      blindedExistenceProofs.push(blindedExistenceProof);
    }

    return new ClaimResponse(claimRequest, blindedExistenceProofs);
  }

  public claimRequestHash: Hash;
  public blindedExistenceProofs: BlindedSignature[];

  constructor(claimRequestHash: Hash, blindedExistenceProofs: BlindedSignature[]) {
    this.claimRequestHash = claimRequestHash;
    this.blindedExistenceProofs = blindedExistenceProofs;
  }

  public hash() {
    const h = Hash.newBuilder('ClaimResponse');
    h.update(this.claimRequestHash.buffer);
    for (const blindedExistenceProof of this.blindedExistenceProofs) {
      h.update(blindedExistenceProof.buffer);
    }
    return h.digest();
  }

  public toPOD(): POD.ClaimResponse {
    return {
      blindedExistenceProofs: this.blindedExistenceProofs.map(x => x.toBech()),
      claimRequestHash: this.claimRequestHash.toBech(),
    };
  }
}
