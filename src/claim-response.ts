import BlindedSignature from './blinded-signature';
import ClaimRequest from './claim-request';
import Hash from './hash';
import * as POD from './pod';

export default class ClaimResponse {
  public static fromPOD(data: any): ClaimResponse | Error {
    const claimRequest = ClaimRequest.fromPOD(data.claimRequest);
    if (claimRequest instanceof Error) {
      return claimRequest;
    }

    const blindedExistenceProof = BlindedSignature.fromBech(data.blindedExistenceProof);
    if (blindedExistenceProof instanceof Error) {
      return blindedExistenceProof;
    }

    return new ClaimResponse(claimRequest, blindedExistenceProof);
  }

  public blindedExistenceProof: BlindedSignature;
  public claimRequest: ClaimRequest;

  constructor(claimRequest: ClaimRequest, blindedExistenceProof: BlindedSignature) {
    this.claimRequest = claimRequest;
    this.blindedExistenceProof = blindedExistenceProof;
  }

  public hash() {
    const h = Hash.newBuilder('ClaimResponse');
    h.update(this.claimRequest.hash().buffer);
    h.update(this.blindedExistenceProof.buffer);
    return h.digest();
  }

  public toPOD(): POD.ClaimResponse {
    return {
      blindedExistenceProof: this.blindedExistenceProof.toBech(),
      claimRequest: this.claimRequest.toPOD(),
    };
  }
}
