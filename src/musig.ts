import * as ecc from './util/ecc';
import * as Buffutils from './util/buffutils';

import PrivateKey from './private-key';
import PublicKey from './public-key';
import Signature from './signature';
import Hash from './hash';

import SHA256 from './util/bcrypto/sha256';

const MUSIG_TAG = SHA256.digest(Buffutils.fromString('MuSig coefficient'));

export default class MuSig {
  static computeEll(pubKeys: ecc.Point[]): Uint8Array {
    // concat all pubkeys in compressed form, and sha256 it..
    return SHA256.digest(...pubKeys.map(p => ecc.Point.toBytes(p)));
  }

  static computeCoefficient(ell: Uint8Array, idx: number) {
    const idxBuf = Buffutils.fromUint32(idx);

    const data = Buffutils.concat(MUSIG_TAG, MUSIG_TAG, ell, idxBuf);
    const hash = SHA256.digest(data);

    const coefficient = ecc.Scalar.fromBytes(hash);
    if (coefficient instanceof Error) {
      throw coefficient;
    }

    return coefficient;
  }

  static sign(privateKeys: PrivateKey[], message: Uint8Array): Signature {
    const rs: ecc.Scalar[] = [];
    const Xs: ecc.Point[] = [];

    for (const privateKey of privateKeys) {
      const ri = ecc.Scalar.fromBytes(Hash.fromMessage('MuSig.k', privateKey.buffer, message).buffer);
      if (ri instanceof Error) {
        throw ri;
      }

      const Xi = privateKey.toPublicKey();

      rs.push(ri);
      Xs.push(Xi);
    }

    const R = ecc.pointAdd(
      ...rs.map(ri => {
        const Ri = ecc.Point.fromPrivKey(ri);
        if (Ri instanceof Error) {
          throw Ri;
        }

        return Ri;
      })
    );

    // TODO: check Xs are unique...
    //   check.checkPubKeysUnique(Xs);

    const ell = MuSig.computeEll(Xs);

    const coefficients: ecc.Scalar[] = [];
    let X: undefined | ecc.Point;
    for (let i = 0; i < Xs.length; i++) {
      const Xi = Xs[i];
      const coefficient = MuSig.computeCoefficient(ell, i);
      const summand = ecc.pointMultiply(Xi, coefficient);
      coefficients.push(coefficient);
      if (X === undefined) {
        X = summand;
      } else {
        X = ecc.pointAdd(X, summand);
      }
    }

    let e = getE(R.x, X!, message);

    // TODO...

    throw new Error('TODO:...');
  }

  static combinePublicKeys(publicKeys: PublicKey[]): PublicKey {
    const ell = MuSig.computeEll(publicKeys);
    let X = null;
    for (let i = 0; i < publicKeys.length; i++) {
      const Xi = publicKeys[i];

      const coefficient = MuSig.computeCoefficient(ell, i);
      const summand = ecc.pointMultiply(Xi, coefficient);
      if (X === null) {
        X = summand;
      } else {
        X = ecc.pointAdd(X, summand);
      }
    }
    return new PublicKey(X!.x, X!.y);
  }
}

function getE(Rx: bigint, P: ecc.Point, m: Uint8Array) {
  const hash = SHA256.digest(ecc.Scalar.toBytes(Rx), ecc.Point.toBytes(P), m);
  const e = ecc.Scalar.fromBytes(hash);
  if (e instanceof Error) {
    throw e;
  }
  return e;
}
