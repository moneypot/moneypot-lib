import BlindedMessage from './blinded-message';
import Bounty from './bounty';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import Magnitude from './magnitude';

import ClaimRequest, { CoinClaim } from './claim-request';
import Transfer from './full-transfer';

export default class ClaimBountyRequest {
  public static newAuthorized(claimantPrivateKey: PrivateKey, claim: Bounty, coins: CoinClaim[]) {
    const hash = ClaimRequest.hashOf(claim.hash(), coins);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimBountyRequest(claim, coins, authorization);
  }

  public static fromPOD(data: any): ClaimBountyRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimBountyRequest.fromPOD expected an object');
    }

    const claim = Bounty.fromPOD(data.claim);
    if (claim instanceof Error) {
      return claim;
    }

    if (!Array.isArray(data.coins)) {
      return new Error('ClaimBountyRequest expected an array of coins');
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

      const magnitude = Magnitude.fromPOD(coin.magnitude);
      if (magnitude instanceof Error) {
        return magnitude;
      }

      coins.push({ blindingNonce, blindedOwner, magnitude });
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimBountyRequest(claim, coins, authorization);
  }

  public claim: Bounty;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(claim: Bounty, coins: CoinClaim[], authorization: Signature) {
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

  public toPOD(): POD.ClaimBountyRequest {
    return {
      authorization: this.authorization.toBech(),
      claim: this.claim.toPOD(),
      coins: this.coins.map(coin => ({
        blindingNonce: coin.blindingNonce.toBech(),
        blindedOwner: coin.blindedOwner.toBech(),
        magnitude: coin.magnitude.toPOD(),
      })),
    };
  }
}
