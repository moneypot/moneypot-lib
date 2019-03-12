import BlindedSignature from './blinded-signature';
import ClaimRequest from './claim-request';
import Hash from './hash';
import * as POD from './pod';


// The response embeds the request, to make it easier to store/verify

export default class ClaimResponse {
  public static fromPOD(data: any): ClaimResponse | Error {
    if (typeof data !== 'object') {
      throw new Error('ClaimResponse must be an object');
    }

    const claimRequest = ClaimRequest.fromPOD(data.claimRequest);
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

  public claimRequest: ClaimRequest;
  public blindedExistenceProofs: BlindedSignature[];

  constructor(claimRequest: ClaimRequest, blindedExistenceProofs: BlindedSignature[]) {
    this.claimRequest = claimRequest;
    this.blindedExistenceProofs = blindedExistenceProofs;
  }

  public hash() {
    const h = Hash.newBuilder('ClaimResponse');
    h.update(this.claimRequest.hash().buffer);
    for (const blindedExistenceProof of this.blindedExistenceProofs) {
      h.update(blindedExistenceProof.buffer);
    }
    return h.digest();
  }

  public toPOD(): POD.ClaimResponse {
    return {
      blindedExistenceProofs: this.blindedExistenceProofs.map(x => x.toBech()),
      claimRequest: this.claimRequest.toPOD(),
    };
  }
}
