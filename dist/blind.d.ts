import BlindedMessage from './blinded-message';
import BlindedSignature from './blinded-signature';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as ecc from './util/ecc';
export declare function blindMessage(secretRandomSeed: Uint8Array, nonce: PublicKey, signer: PublicKey, message: Uint8Array): Promise<[ecc.Unblinder, BlindedMessage]>;
export declare function blindSign(signer: PrivateKey, nonce: PrivateKey, blindedMessage: BlindedMessage): BlindedSignature;
export declare function unblind(unblinder: ecc.Unblinder, blindedSig: BlindedSignature): Signature;
