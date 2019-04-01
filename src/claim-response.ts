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

    if (!Array.isArray(data.blindedReceipts)) {
      return new Error('expected blindedReceipts in ClaimResponse to be an array');
    }

    const blindedReceipts: BlindedSignature[] = [];
    for (const bep of data.blindedReceipts) {
      const blindedReceipt = BlindedSignature.fromBech(bep);
      if (blindedReceipt instanceof Error) {
        return blindedReceipt;
      }

      blindedReceipts.push(blindedReceipt);
    }

    return new ClaimResponse(claimRequest, blindedReceipts);
  }

  public claimRequest: ClaimRequest;
  public blindedReceipts: BlindedSignature[];

  constructor(claimRequest: ClaimRequest, blindedReceipts: BlindedSignature[]) {
    this.claimRequest = claimRequest;
    this.blindedReceipts = blindedReceipts;
  }

  public hash() {
    const h = Hash.newBuilder('ClaimResponse');
    h.update(this.claimRequest.hash().buffer);
    for (const blindedReceipt of this.blindedReceipts) {
      h.update(blindedReceipt.buffer);
    }
    return h.digest();
  }

  public toPOD(): POD.ClaimResponse {
    return {
      blindedReceipts: this.blindedReceipts.map(x => x.toBech()),
      claimRequest: this.claimRequest.toPOD(),
    };
  }
}
