import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import CoinRequest from './coin-request';
import Magnitude from './magnitude';

export default class ClaimRequest {
  public static newAuthorized(claimHash: Hash, coinRequests: CoinRequest[], claimantPrivateKey: PrivateKey) {
    const hash = ClaimRequest.hashOf(claimHash, coinRequests);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimRequest(claimHash, coinRequests, authorization);
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

  public claimHash: Hash;
  public coinRequests: CoinRequest[];
  public authorization: Signature;

  constructor(claimHash: Hash, coinRequests: CoinRequest[], authorization: Signature) {
    this.claimHash = claimHash;
    this.coinRequests = coinRequests;
    this.authorization = authorization;
  }

  public static hashOf(claimHash: Hash, coinRequests: CoinRequest[]) {
    const h = Hash.newBuilder('ClaimRequest');
    h.update(claimHash.buffer);
    for (const cc of coinRequests) {
      h.update(cc.blindedOwner.buffer);
      h.update(cc.blindingNonce.buffer);
      h.update(cc.magnitude.buffer);
    }
    return h.digest();
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claimHash, this.coinRequests);
  }

  public toPOD(): POD.ClaimRequest {
    return {
      authorization: this.authorization.toPOD(),
      claimHash: this.claimHash.toPOD(),
      coinRequests: this.coinRequests.map(cr => ({
        blindedOwner: cr.blindedOwner.toPOD(),
        blindingNonce: cr.blindingNonce.toPOD(),
        magnitude: cr.magnitude.toPOD(),
      })),
    };
  }
}
