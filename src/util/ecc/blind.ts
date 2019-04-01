import * as check from './check'
import { Point, pointAdd as add, pointMultiply as mul, scalarAdd, scalarMultiply } from './elliptic'
import SHA256 from '../bcrypto/sha256'
import { Signature } from './signature'
import { bufferToBigInt, curve, getE, jacobi, pointToBuffer, utf8ToBuffer, concatBuffers } from './util'

// A BlindedSignature is a signature that a signer produces at the behest of
// another party without learning what they have signed.

export type BlindedMessage = { c: bigint /* c = challenge */ }
export type Unblinder = { alpha: bigint; r: bigint /* R.x */ }
export type BlindedSignature = { s: bigint }

export function blindMessage(
    secret: Uint8Array,
    nonce: Point,
    signer: Point,
    message: Uint8Array
): [Unblinder, BlindedMessage] {
    const R = nonce
    const P = signer

    const alpha = bufferToBigInt(
      SHA256.mac(utf8ToBuffer('alpha'), concatBuffers(secret, pointToBuffer(nonce), pointToBuffer(signer), message))
    )

    // spin beta until we find quadratic residue
    let retry = 0
    let beta
    let RPrime
    while (true) {
        beta = bufferToBigInt(
          SHA256.mac(utf8ToBuffer('beta'), concatBuffers(
                secret,
                pointToBuffer(nonce),
                pointToBuffer(signer),
                message,
                Uint8Array.of(retry),
            ))
        )

        RPrime = add(R, mul(curve.g, alpha), mul(P, beta))

        if (jacobi(RPrime.y) === 1n) {
            break
        } else {
            retry++
        }
    }

    // the challenge
    const cPrime = getE(RPrime.x, P, message)

    // the blinded challenge
    const c = scalarAdd(cPrime, beta)

    return [{ alpha, r: RPrime.x }, { c }]
}

export function blindSign(signer: bigint, nonce: bigint, { c }: BlindedMessage): BlindedSignature {
    const x = signer
    const k = nonce

    const s = scalarAdd(k, scalarMultiply(c, x))
    return { s }
}

export function unblind({ alpha, r }: Unblinder, blindedSig: BlindedSignature): Signature {
    const s = scalarAdd(blindedSig.s, alpha)
    return { r, s }
}