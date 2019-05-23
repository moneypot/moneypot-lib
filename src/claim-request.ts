import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';
import Magnitude from './magnitude';

export interface CoinClaim {
  blindingNonce: PublicKey;
  blindedOwner: BlindedMessage;
  magnitude: Magnitude;
}

export default class ClaimRequest {

  public static fromPOD(data: any): ClaimRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimRequest.fromPOD expected an object');
    }

    const claim = Hash.fromPOD(data.claim);
    if (claim instanceof Error) {
      return claim;
    }

    const coinsRequestHash = Hash.fromPOD(data.coinsRequestHash);
    if (coinsRequestHash instanceof Error) {
      return coinsRequestHash;
    }

  
    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimRequest(claim, coinsRequestHash, authorization);
  }

  public claimHash: Hash;
  public coinsRequestHash: Hash;
  public authorization: Signature;

  constructor(claimHash: Hash, coinsRequestHash: Hash, authorization: Signature) {
    this.claimHash = claimHash;
    this.coinsRequestHash = coinsRequestHash;
    this.authorization = authorization;
  }

  public static hashOf(claimHash: Hash, coinsRequestHash: Hash) {
    const h = Hash.newBuilder('ClaimRequest');
    h.update(claimHash.buffer);
    h.update(coinsRequestHash.buffer);
    return h.digest();
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claimHash, this.coinsRequestHash);
  }

  public toPOD(): POD.ClaimRequest {
    return {
      authorization: this.authorization.toPOD(),
      claimHash: this.claimHash.toPOD(),
      coinsRequestHash: this.coinsRequestHash.toPOD(),
    };
  }
}
