import { Point, pointMultiply as mul, pointAdd as add, scalarAdd, scalarMultiply } from './elliptic';
import { Signature } from './signature';
import {
  utf8ToBuffer,
  concatBuffers as concat,
  secp256k1 as curve,
  bufferToBigInt,
  bufferFromBigInt,
  jacobi,
  pointToBuffer,
} from './util';
import { hash, hmac } from './sha256';

export type BlindedMessage = { c: bigint /* c = challenge */ };
export type Unblinder = { alpha: bigint; r: bigint /* R.x */ };
export type BlindedSignature = { s: bigint };

export function blindMessage(
  secret: Uint8Array,
  nonce: Point,
  signer: Point,
  message: Uint8Array
): [Unblinder, BlindedMessage] {
  const R = nonce;
  const P = signer;

  const alpha = bufferToBigInt(
    hmac(utf8ToBuffer('alpha'), [secret, pointToBuffer(nonce), pointToBuffer(signer), message])
  );

  // spin beta until we find quadratic residue
  let retry = 0;
  let beta;
  let RPrime;
  while (true) {
    beta = bufferToBigInt(
      hmac(utf8ToBuffer('beta'), [secret, pointToBuffer(nonce), pointToBuffer(signer), message, Uint8Array.of(retry)])
    );

    RPrime = add(R, mul(curve.g, alpha), mul(P, beta));

    if (jacobi(RPrime.y) === BigInt(1)) {
      break;
    } else {
      retry++;
    }
  }

  // the challenge
  const cPrime = bufferToBigInt(hash(concat(bufferFromBigInt(RPrime.x), pointToBuffer(P), message))) % curve.n;

  // the blinded challenge
  const c = scalarAdd(cPrime, beta);

  return [{ alpha, r: RPrime.x }, { c }];
}

export function blindSign(signer: bigint, nonce: bigint, { c }: BlindedMessage): BlindedSignature {
  const s = scalarAdd(nonce, scalarMultiply(c, signer));
  return { s };
}

export function unblind({ alpha, r }: Unblinder, blindedSig: BlindedSignature): Signature {
  const s = scalarAdd(blindedSig.s, alpha);
  return { r, s };
}
