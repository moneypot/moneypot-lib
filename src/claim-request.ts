import BlindedMessage from './blinded-message';
import Bounty from './bounty';
import Hash from './hash';
import { Magnitude } from './pod';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';

// represents a bounty request

export interface CoinClaim {
  blindingNonce: PublicKey;
  blindedOwner: BlindedMessage;
  magnitude: Magnitude;
}

export default class ClaimRequest {
  public static newAuthorized(claimantPrivateKey: PrivateKey, bounty: Bounty, coins: CoinClaim[]) {
    const hash = ClaimRequest.hashOf(bounty.hash(), coins);
    const authorization = Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimRequest(bounty, coins, authorization);
  }

  public static fromPOD(data: any): ClaimRequest | Error {
    if (typeof data !== 'object') {
      return new Error('ClaimRequest.fromPOD expected an object');
    }

    const bounty = Bounty.fromPOD(data.bounty);
    if (bounty instanceof Error) {
      return bounty;
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

      coins.push({ blindingNonce, blindedOwner, magnitude });
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimRequest(bounty, coins, authorization);
  }

  public bounty: Bounty;
  public coins: CoinClaim[];
  public authorization: Signature;

  constructor(bounty: Bounty, coins: CoinClaim[], authorization: Signature) {
    this.bounty = bounty;
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
    return ClaimRequest.hashOf(this.bounty.hash(), this.coins);
  }

  public toPOD(): POD.ClaimRequest {
    return {
      authorization: this.authorization.toBech(),
      bounty: this.bounty.toPOD(),
      coins: this.coins.map(coin => ({
        blindingNonce: coin.blindingNonce.toBech(),
        blindedOwner: coin.blindedOwner.toBech(),
        magnitude: coin.magnitude,
      })),
    };
  }
}
