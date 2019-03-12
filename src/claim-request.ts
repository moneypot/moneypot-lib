import BlindedMessage from './blinded-message';
import ClaimableCoins from './claimable-coins';
import Hash from './hash';
import { Magnitude } from './pod';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';

// represents a claim request

export interface CoinClaim {
  blindingNonce: PublicKey,
  blindedOwner: BlindedMessage,
  magnitude: Magnitude
}



export default class ClaimRequest {
  public static newAuthorized(
    claimantPrivateKey: PrivateKey,
    claim: ClaimableCoins,
    coins: CoinClaim[],
  ) {
    const hash = ClaimRequest.hashOf(claim.hash(), coins);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimRequest(claim, coins, authorization);
  }

  public static fromPOD(data: any): ClaimRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimRequest.fromPOD expected an object');
    }


    const claim = ClaimableCoins.fromPOD(data.claim);
    if (claim instanceof Error) {
      return claim;
    }

    if (!Array.isArray(data.coins)) {
      return new Error('ClaimRequest expected an array of coins');
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
        return new Error('all coins must have a magnitude in ClaimRequest');
      }

      coins.push({ blindingNonce, blindedOwner, magnitude })
    }



    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimRequest(claim, coins, authorization);
  }

  public claim: ClaimableCoins;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(claim: ClaimableCoins, coins: CoinClaim[], authorization: Signature) {
    this.claim = claim;
    this.coins = coins;
    this.authorization = authorization;
  }

  public static hashOf(claimableHash: Hash, coins: CoinClaim[]) {
    const h = Hash.newBuilder('ClaimRequest');
    h.update(claimableHash.buffer);
    for (const coin of coins) {
      h.update(coin.blindedOwner.buffer);
      h.update(coin.blindingNonce.buffer);
      h.update(Buffutils.fromUint8(coin.magnitude));
    }

    return h.digest();
  }

  public hash(): Hash {
    return ClaimRequest.hashOf(this.claim.hash(), this.coins);
  }


  public toPOD(): POD.ClaimRequest {
    return {
      authorization: this.authorization.toBech(),
      claim: this.claim.toPOD(),
      coins: this.coins.map(coin => ({
        blindingNonce: coin.blindingNonce.toBech(),
        blindedOwner: coin.blindedOwner.toBech(),
        magnitude: coin.magnitude
      })),
    };
  }
}
