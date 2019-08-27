import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import CoinRequest from './coin-request';
import Magnitude from './magnitude';

export default class ClaimRequest {
  public static newAuthorized(claimableHash: Hash, coinRequests: CoinRequest[], claimantPrivateKey: PrivateKey) {
    const hash = ClaimRequest.hashOf(claimableHash, coinRequests);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimRequest(claimableHash, coinRequests, authorization);
  }

  public static fromPOD(data: any): ClaimRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimRequest.fromPOD expected an object');
    }

    const claimHash = Hash.fromPOD(data.claimHash);
    if (claimHash instanceof Error) {
      return claimHash;
    }

    if (!Array.isArray(data.coinRequests)) {
      return new Error('ClaimRequest.fromPOD expected an array for coinRequests');
    }

    const coinRequests = [];
    for (const coin of data.coinRequests) {
      const blindingNonce = PublicKey.fromPOD(coin.blindingNonce);
      if (blindingNonce instanceof Error) {
        return blindingNonce;
      }

      const blindedOwner = BlindedMessage.fromPOD(coin.blindedOwner);
      if (blindedOwner instanceof Error) {
        return blindedOwner;
      }

      const magnitude = Magnitude.fromPOD(coin.magnitude);
      if (magnitude instanceof Error) {
        return magnitude;
      }

      coinRequests.push({ blindingNonce, blindedOwner, magnitude });
    }

    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimRequest(claimHash, coinRequests, authorization);
  }

  public claimableHash: Hash;
  public coinRequests: CoinRequest[];
  public authorization: Signature;

  constructor(claimableHash: Hash, coinRequests: CoinRequest[], authorization: Signature) {
    this.claimableHash = claimableHash;
    this.coinRequests = coinRequests;
    this.authorization = authorization;
  }

  public static hashOf(claimableHash: Hash, coinRequests: CoinRequest[]) {
    const h = Hash.newBuilder('ClaimRequest');
    h.update(claimableHash.buffer);
    for (const cc of coinRequests) {
      h.update(cc.blindedOwner.buffer);
      h.update(cc.blindingNonce.buffer);
      h.update(cc.magnitude.buffer);
    }
    return h.digest();
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claimableHash, this.coinRequests);
  }

  public toPOD(): POD.ClaimRequest {
    return {
      hash: this.hash().toPOD(),
      authorization: this.authorization.toPOD(),
      claimableHash: this.claimableHash.toPOD(),
      coinRequests: this.coinRequests.map(cr => ({
        blindedOwner: cr.blindedOwner.toPOD(),
        blindingNonce: cr.blindingNonce.toPOD(),
        magnitude: cr.magnitude.toPOD(),
      })),
    };
  }

  // how much is being claimed
  public amount() {
    let n = 0;
    for (const coinRequest of this.coinRequests) {
      n += coinRequest.magnitude.toAmount();
    }
    return n;
  }
}
