import BlindedMessage from './blinded-message';
import Hookin from './hookin';
import Hash from './hash';
import { Magnitude } from './pod';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';

import ClaimRequest, { CoinClaim } from './claim-request'


export default class ClaimHookinRequest {
  public static newAuthorized(claimantPrivateKey: PrivateKey, claim: Hookin, coins: CoinClaim[]) {
    const hash = ClaimRequest.hashOf(claim.hash(), coins);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimHookinRequest(claim, coins, authorization);
  }

  public static fromPOD(data: any): ClaimHookinRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimHookinRequest.fromPOD expected an object');
    }

    const claim = Hookin.fromPOD(data.claim);
    if (claim instanceof Error) {
      return claim;
    }

    if (!Array.isArray(data.coins)) {
      return new Error('ClaimHookinRequest expected an array of coins');
    }

    const coins = [];
    for (const coin of data.coins) {
      const blindingNonce = PublicKey.fromBech(coin.blindingNonce);
      if (blindingNonce instanceof Error) {
        return blindingNonce;
      }

      const blindedOwner = BlindedMessage.fromBech(coin.blindedOwner);
      if (blindedOwner instanceof Error) {
        return blindedOwner;
      }

      const magnitude = coin.magnitude;
      if (!POD.isMagnitude(magnitude)) {
        return new Error('all coins must have a magnitude in ClaimHookinRequest');
      }

      coins.push({ blindingNonce, blindedOwner, magnitude });
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimHookinRequest(claim, coins, authorization);
  }

  public claim: Hookin;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(claim: Hookin, coins: CoinClaim[], authorization: Signature) {
    this.claim = claim;
    this.coins = coins;
    this.authorization = authorization;
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claim.hash(), this.coins);
  }

  public toPOD(): POD.ClaimHookinRequest {
    return {
      authorization: this.authorization.toBech(),
      claim: this.claim.toPOD(),
      coins: this.coins.map(coin => ({
        blindingNonce: coin.blindingNonce.toBech(),
        blindedOwner: coin.blindedOwner.toBech(),
        magnitude: coin.magnitude,
      })),
    };
  }
}
