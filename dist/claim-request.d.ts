import BlindedMessage from './blinded-message';
import ClaimableCoin from './claimable-coin';
import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as POD from './pod';
export default class ClaimRequest {
    static newAuthorized(claimantPrivateKey: PrivateKey, magnitude: number, blindingNonce: PublicKey, blindedOwner: BlindedMessage): Promise<ClaimRequest>;
    static fromPOD(data: any): ClaimRequest | Error;
    coin: ClaimableCoin;
    blindingNonce: PublicKey;
    blindedOwner: BlindedMessage;
    authorization: Signature;
    constructor(coin: ClaimableCoin, blindingNonce: PublicKey, blindedOwner: BlindedMessage, authorization: Signature);
    static hashOf(coinHash: Hash, blindingNonce: PublicKey, blindedOwner: BlindedMessage): Promise<Hash>;
    hash(): Promise<Hash>;
    isAuthorized(): Promise<boolean>;
    toPOD(): POD.ClaimRequest;
}
