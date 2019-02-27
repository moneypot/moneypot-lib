import BlindedMessage from './blinded-message';
import BlindedSignature from './blinded-signature';

import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import * as ecc from './util/ecc';

export async function blindMessage(
  secretRandomSeed: Uint8Array,
  nonce: PublicKey,
  signer: PublicKey,
  message: Uint8Array,
): Promise<[ecc.Unblinder, BlindedMessage]> {
  const [unblinder, bm] = await ecc.blindMessage(secretRandomSeed, nonce, signer, message);
  return [unblinder, new BlindedMessage(bm.c)];
}

export function blindSign(signer: PrivateKey, nonce: PrivateKey, blindedMessage: BlindedMessage): BlindedSignature {
  const bs = ecc.blindSign(signer.scalar, nonce.scalar, blindedMessage);
  return new BlindedSignature(bs.s);
}

export function unblind(unblinder: ecc.Unblinder, blindedSig: BlindedSignature): Signature {
  const sig = ecc.unblind(unblinder, blindedSig);
  return new Signature(sig.r, sig.s);
}
