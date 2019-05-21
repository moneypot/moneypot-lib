import BlindedMessage from './blinded-message';
import Change from './change';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import Magnitude from './magnitude';

import ClaimRequest, { CoinClaim } from './claim-request';

export default class ClaimChangeRequest {
  public static newAuthorized(claimantPrivateKey: PrivateKey, claim: Change, coins: CoinClaim[]) {
    const hash = ClaimRequest.hashOf(claim.hash(), coins);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimChangeRequest(claim, coins, authorization);
  }

  public static fromPOD(data: any): ClaimChangeRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimChangeRequest.fromPOD expected an object');
    }

    const claim = Change.fromPOD(data.claim);
    if (claim instanceof Error) {
      return claim;
    }

    if (!Array.isArray(data.coins)) {
      return new Error('ClaimChangeRequest expected an array of coins');
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

    return new ClaimChangeRequest(claim, coins, authorization);
  }

  public claim: Change;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(claim: Change, coins: CoinClaim[], authorization: Signature) {
    this.claim = claim;
    this.coins = coins;
    this.authorization = authorization;
  }

  public prune(): ClaimRequest {
    return new ClaimRequest(this.claim.hash(), this.coins, this.authorization);
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claim.hash(), this.coins);
  }

  public toPOD(): POD.ClaimChangeRequest {
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

  public verify() {
    return this.authorization.verify(this.hash().buffer, this.claim.claimant);
  }
}
