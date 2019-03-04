import BlindedMessage from './blinded-message';
import ClaimableCoin from './claimable-coin';
import Hash from './hash';
import PublicKey from './public-key';
import Signature from './signature';
// represents a claim request
export default class ClaimRequest {
    static newAuthorized(claimantPrivateKey, magnitude, blindingNonce, blindedOwner) {
        const pubkey = claimantPrivateKey.toPublicKey();
        const coin = new ClaimableCoin(pubkey, magnitude);
        const hash = ClaimRequest.hashOf(coin.hash(), blindingNonce, blindedOwner);
        const authorization = Signature.compute(hash.buffer, claimantPrivateKey);
        return new ClaimRequest(coin, blindingNonce, blindedOwner, authorization);
    }
    static fromPOD(data) {
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
    constructor(coin, blindingNonce, blindedOwner, authorization) {
        this.coin = coin;
        this.blindingNonce = blindingNonce;
        this.blindedOwner = blindedOwner;
        this.authorization = authorization;
    }
    static hashOf(coinHash, blindingNonce, blindedOwner) {
        const h = Hash.newBuilder('ClaimRequest');
        h.update(coinHash.buffer);
        h.update(blindingNonce.buffer);
        h.update(blindedOwner.buffer);
        return h.digest();
    }
    hash() {
        return ClaimRequest.hashOf(this.coin.hash(), this.blindingNonce, this.blindedOwner);
    }
    isAuthorized() {
        return this.authorization.verify((this.hash()).buffer, this.coin.claimant);
    }
    toPOD() {
        return {
            authorization: this.authorization.toBech(),
            blindedOwner: this.blindedOwner.toBech(),
            blindingNonce: this.blindingNonce.toBech(),
            coin: this.coin.toPOD(),
        };
    }
}
//# sourceMappingURL=claim-request.js.map