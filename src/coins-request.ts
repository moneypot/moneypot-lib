import BlindedMessage from './blinded-message';
import Hash from './hash';
import PublicKey from './public-key';
import * as POD from './pod';
import Magnitude from './magnitude';


export interface CoinRequest {
  blindingNonce: PublicKey;
  blindedOwner: BlindedMessage;
  magnitude: Magnitude;
}

export default class CoinsRequest {

  public static fromPOD(data: any): CoinsRequest | Error {
    if (Array.isArray(data)) {
      return new Error('CoinClaims.fromPOD expected an array');
    }

    const coinClaims = [];
    for (const coin of data) {
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

      coinClaims.push({ blindingNonce, blindedOwner, magnitude });
    }

    return new CoinsRequest(coinClaims);
  }

  public coinRequest: CoinRequest[];

  constructor(coinClaims: CoinRequest[]) {
    this.coinRequest = coinClaims;
  }

  public static hashOf(coinClaims: CoinRequest[]) {
    const h = Hash.newBuilder('CoinsRequest');
    for (const cc of coinClaims) {
      h.update(cc.blindedOwner.buffer);
      h.update(cc.blindingNonce.buffer);
      h.update(cc.magnitude.buffer);
    }

    return h.digest();
  }

  public hash(): Hash {
    return CoinsRequest.hashOf(this.coinRequest);
  }

  public toPOD(): POD.CoinsRequest {
    return this.coinRequest.map(coin => ({
      blindingNonce: coin.blindingNonce.toPOD(),
      blindedOwner: coin.blindedOwner.toPOD(),
      magnitude: coin.magnitude.toPOD(),
    }));
  }
}
