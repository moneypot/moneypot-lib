import BlindedMessage from './blinded-message';
import ClaimableCoin from './claimable-coin';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';

// represents a claim request

export default class ClaimRequest {
  public static async newAuthorized(
    claimantPrivateKey: PrivateKey,
    magnitude: number,
    blindingNonce: PublicKey,
    blindedOwner: BlindedMessage
  ) {
    const pubkey = claimantPrivateKey.toPublicKey();
    const coin = new ClaimableCoin(pubkey, magnitude);
    const hash = await ClaimRequest.hashOf(await coin.hash(), blindingNonce, blindedOwner);
    const authorization = await Signature.compute(hash.buffer, claimantPrivateKey);

    return new ClaimRequest(coin, blindingNonce, blindedOwner, authorization);
  }

  public static fromPOD(data: any): ClaimRequest | Error {
    const coin = ClaimableCoin.fromPOD(data.coin);
    if (coin instanceof Error) {
      return coin;
    }

    const blindNonce = PublicKey.fromBech(data.blindingNonce);
    if (blindNonce instanceof Error) {
      return blindNonce;
    }

    const blindedOwner = BlindedMessage.fromBech(data.blindedOwner);
    if (blindedOwner instanceof Error) {
      return blindedOwner;
    }

    const authorization = Signature.fromBech(data.authorization);
    if (authorization instanceof Error) {
      return authorization;
    }

    return new ClaimRequest(coin, blindNonce, blindedOwner, authorization);
  }

  public coin: ClaimableCoin;
  public blindingNonce: PublicKey;
  public blindedOwner: BlindedMessage;
  public authorization: Signature;

  constructor(coin: ClaimableCoin, blindingNonce: PublicKey, blindedOwner: BlindedMessage, authorization: Signature) {
    this.coin = coin;
    this.blindingNonce = blindingNonce;
    this.blindedOwner = blindedOwner;
    this.authorization = authorization;
  }

  public static hashOf(coinHash: Hash, blindingNonce: PublicKey, blindedOwner: BlindedMessage) {
    const h = Hash.newBuilder('ClaimRequest');
    h.update(coinHash.buffer);
    h.update(blindingNonce.buffer);
    h.update(blindedOwner.buffer);
    return h.digest();
  }

  public async hash(): Promise<Hash> {
    return ClaimRequest.hashOf(await this.coin.hash(), this.blindingNonce, this.blindedOwner);
  }

  public async isAuthorized() {
    return this.authorization.verify((await this.hash()).buffer, this.coin.claimant);
  }

  public toPOD(): POD.ClaimRequest {
    return {
      authorization: this.authorization.toBech(),
      blindedOwner: this.blindedOwner.toBech(),
      blindingNonce: this.blindingNonce.toBech(),
      coin: this.coin.toPOD(),
    };
  }
}
