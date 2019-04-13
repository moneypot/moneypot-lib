import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';
import Magnitude from './magnitude';

// represents a pruned request

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

    if (!Array.isArray(data.coins)) {
      return new Error('ClaimRequest expected an array of coins');
    }

    const coins = [];
    for (const coin of data.coins) {
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

      coins.push({ blindingNonce, blindedOwner, magnitude });
    }

    const authorization = Signature.fromPOD(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimRequest(claim, coins, authorization);
  }

  public claim: Hash;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(claim: Hash, coins: CoinClaim[], authorization: Signature) {
    this.claim = claim;
    this.coins = coins;
    this.authorization = authorization;
  }

  public static hashOf(claim: Hash, coins: CoinClaim[]) {
    const h = Hash.newBuilder('ClaimRequest');
    h.update(claim.buffer);
    for (const coin of coins) {
      h.update(coin.blindedOwner.buffer);
      h.update(coin.blindingNonce.buffer);
      h.update(coin.magnitude.buffer);
    }

    return h.digest();
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claim, this.coins);
  }

  public toPOD(): POD.ClaimRequest {
    return {
      authorization: this.authorization.toPOD(),
      claim: this.claim.toPOD(),
      coins: this.coins.map(coin => ({
        blindingNonce: coin.blindingNonce.toPOD(),
        blindedOwner: coin.blindedOwner.toPOD(),
        magnitude: coin.magnitude.toPOD(),
      })),
    };
  }
}
