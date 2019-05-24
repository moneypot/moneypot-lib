import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import PrivateKey from './private-key';
import Signature from './signature';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';
import Magnitude from './magnitude';


export default class ClaimRequest {

  public static newAuthorized( claimHash: Hash, coinsRequestHash: Hash, claimantPrivateKey: PrivateKey, ) {	

    const hash = ClaimRequest.hashOf(claimHash, coinsRequestHash);	
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);	

     return new ClaimRequest(claimHash, coinsRequestHash, authorization);	
  }


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
