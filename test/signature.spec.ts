import { strictEqual, strict } from 'assert';
import PrivateKey from '../src/private-key';
import Signature from '../src/signature';
import PublicKey from '../src/public-key';
import { SHA256, Buffutils } from '../src';
import {
  bufferFromHex,
  isEven,
  pointToBuffer,
  bufferToBigInt,
  bufferToHex,
  concatBuffers,
  pointFromX,
  buffer32FromBigInt,
} from '../src/util/ecc/util';
import {
  pubkeyCombine,
  calculateL,
  sessionInit,
  bipCalculateL,
  bipPubkeyCombine,
  calculateCoefficient,
  sessionNonceCombine,
  partialSignbipPlusbipGetE,
  partialSigbipVerify,
  partialSigCombine,
} from '../src/util/ecc/mu-sig';
import { equal } from '../src/util/assert';
import { fromBigInt, fromHex, toBigInt, fromString } from '../src/util/buffutils';

import Data from './vectors.json';
import { verifyBip340 } from '../src/util/ecc/signature';

describe('signature', () => {
  it('should work', () => {
    const priv = PrivateKey.fromRand();

    const message = Buffer.from('Wow, such a message');

    const sig = Signature.compute(message, priv);

    const serialized = sig.toPOD();

    const sig2 = Signature.fromPOD(serialized);
    if (sig2 instanceof Error) {
      throw sig2;
    }

    strictEqual(sig2.toPOD(), serialized);

    strictEqual(sig2.verify(message, priv.toPublicKey()), true);
  });

  it('should handle aggregation', () => {
    const priv1 = PrivateKey.fromRand();
    const priv2 = PrivateKey.fromRand();

    const message = Buffer.from('Wow, such a message');

    const priv = PrivateKey.combine([priv1, priv2]);

    const pub = PublicKey.combine([priv1.toPublicKey(), priv2.toPublicKey()]);

    const sig = Signature.compute(message, priv);

    strictEqual(sig.verify(message, pub), true);

    strictEqual(priv.toPublicKey().toPOD(), pub.toPOD());
  });

  it('can compute pubkeys for privkeys such as ' + Data[0].privKeys[0], () => {
    // given
    Data.forEach(element => {
      for (let index = 0; index < element.privKeys.length; index++) {
        const p = element.privKeys[index];
        const fromHexPriv = fromHex(p);
        if (fromHexPriv instanceof Error) throw fromHexPriv;
        const newKey = PrivateKey.fromBytes(fromHexPriv);
        if (newKey instanceof Error) throw newKey;
        strictEqual(bufferToHex(buffer32FromBigInt(newKey.toPublicKey().x)), element.pubKeys[index]);
      }
    });
  });

  it('can compute ell such as ' + Data[0].ell, () => {
    // given
    Data.forEach(element => {
      let pubKeys: Uint8Array[] = []; // Uint8array = hex x-coord
      for (let index = 0; index < element.pubKeys.length; index++) {
        const x = element.pubKeys[index];
        const fromHexPub = fromHex(x);

        if (fromHexPub instanceof Error) throw fromHexPub;

        pubKeys.push(fromHexPub);
      }
      // construct the pubkeys from the privkeys.
      // to make sure it checks out with the vectors given by guggero, we determine L as the concat of X, not (isYodd + X), so 32/31 v 33 bytes as the hash of each pubkey.
      const result = bipCalculateL(pubKeys);
      // then
      strictEqual(bufferToHex(result), element.ell);
    });
  });

  it('can combine public keys into for example ' + Data[0].pubKeyCombined, () => {
    // given
    Data.forEach(element => {
      let pubKeys: PublicKey[] = []; // Uint8array = hex x-coord
      for (let index = 0; index < element.pubKeys.length; index++) {
        const x = element.pubKeys[index];
        const fromHexPub = fromHex(x);
        if (fromHexPub instanceof Error) throw fromHexPub;
        const point = pointFromX(bufferToBigInt(fromHexPub), BigInt(0)); // always even
        if (point instanceof Error) throw point;
        pubKeys.push(new PublicKey(point.x, point.y));
      }
      // when
      const result = bipPubkeyCombine(pubKeys);

      // then
      strictEqual(bufferToHex(fromBigInt(result.x)), element.pubKeyCombined);
    });
  });

  it('can compute coefficient for for example' + Data[0].ell, () => {
    // given
    Data.forEach(element => {
      const ell = fromHex(element.ell);
      if (ell instanceof Error) {
        throw ell;
      }
      // when / then
      for (let i = 0; i < element.coefficients.length; i++) {
        const result = calculateCoefficient(ell, i);
        strictEqual(bufferToHex(buffer32FromBigInt(result)), element.coefficients[i]);
      }
    });
  });

  // create commits, step 1.
  it('can initialize session for combined key', () => {
    Data.forEach(element => {
      let points: PublicKey[] = [];
      element.pubKeys.forEach(pubkey => {
        const x = fromHex(pubkey);
        if (x instanceof Error) throw x;
        const point = pointFromX(toBigInt(x), BigInt(0));
        if (point instanceof Error) throw point;
        points.push(new PublicKey(point.x, point.y));
      });

      const pubKeyCombined = bipPubkeyCombine(points);
      const pkBuf = fromBigInt(pubKeyCombined.x);

      const pkParity = isEven(pubKeyCombined.y);
      let v: Uint8Array[] = [];
      for (const x of points) {
        v.push(buffer32FromBigInt(x.x));
      }
      const ell = bipCalculateL(v);
      const message = Buffer.from(element.message, 'hex');

      for (let i = 0; i < element.privKeys.length; i++) {
        const sessionId = bufferFromHex(element.sessionIds[i]);
        if (sessionId instanceof Error) {
          throw sessionId;
        }
        const priv = bufferFromHex(element.privKeys[i]);
        if (priv instanceof Error) {
          throw priv;
        }
        const privateKey = PrivateKey.fromBytes(priv);
        if (privateKey instanceof Error) {
          throw privateKey;
        }
        // when
        const session = sessionInit(sessionId, privateKey, message, pkBuf, pkParity, ell, i);

        equal(bufferToHex(ell), element.ell);
        equal(bufferToHex(session.commitment), element.commitments[i]);
        equal(bufferToHex(session.privKeyNonce.buffer), element.secretNonces[i]);
        equal(bufferToHex(buffer32FromBigInt(session.secretSessionKey)), element.secretKeys[i]);
      }
    });
  });

  it('can combine nonces into for example ' + Data[0].nonceCombined, () => {
    Data.forEach(element => {
      let session: any[] = [];
      let points: PublicKey[] = [];
      element.pubKeys.forEach(pubkey => {
        const x = fromHex(pubkey);
        if (x instanceof Error) throw x;
        const point = pointFromX(toBigInt(x), BigInt(0));
        if (point instanceof Error) throw point;
        points.push(new PublicKey(point.x, point.y));
      });

      const pubKeyCombined = bipPubkeyCombine(points);
      const pkBuf = fromBigInt(pubKeyCombined.x);

      const pkParity = isEven(pubKeyCombined.y);

      let v: Uint8Array[] = [];
      for (const x of points) {
        v.push(buffer32FromBigInt(x.x));
      }
      const ell = bipCalculateL(v);
      const message = Buffer.from(element.message, 'hex');

      for (let i = 0; i < element.privKeys.length; i++) {
        const sessionId = bufferFromHex(element.sessionIds[i]);
        if (sessionId instanceof Error) {
          throw sessionId;
        }
        const priv = bufferFromHex(element.privKeys[i]);
        if (priv instanceof Error) {
          throw priv;
        }
        const privateKey = PrivateKey.fromBytes(priv);
        if (privateKey instanceof Error) {
          throw privateKey;
        }
        // when
        const sess = sessionInit(sessionId, privateKey, message, pkBuf, pkParity, ell, i);
        session.push(sess);
      }
      let noncesFromX: PublicKey[] = [];

      for (let index = 0; index < session.length; index++) {
        const element = session[index].nonce;
        const pubKey = pointFromX(element, BigInt(0));
        if (pubKey instanceof Error) {
          throw pubKey;
        }
        noncesFromX.push(new PublicKey(pubKey.x, pubKey.y));
      }
      const result = sessionNonceCombine(noncesFromX);

      // then
      strictEqual(bufferToHex(buffer32FromBigInt(result.R.x)), element.nonceCombined);
    });
  });

  it('can partially sign for for example ' + Data[0].partialSigs[0], () => {
    Data.forEach(element => {
      let session: any[] = [];
      let points: PublicKey[] = [];
      element.pubKeys.forEach(pubkey => {
        const x = fromHex(pubkey);
        if (x instanceof Error) throw x;
        const point = pointFromX(toBigInt(x), BigInt(0));
        if (point instanceof Error) throw point;
        points.push(new PublicKey(point.x, point.y));
      });

      const pubKeyCombined = bipPubkeyCombine(points);
      const pkBuf = fromBigInt(pubKeyCombined.x);

      const pkParity = isEven(pubKeyCombined.y);

      let v: Uint8Array[] = [];
      for (const x of points) {
        v.push(buffer32FromBigInt(x.x));
      }
      const ell = bipCalculateL(v);
      const message = Buffer.from(element.message, 'hex');

      for (let i = 0; i < element.privKeys.length; i++) {
        const sessionId = bufferFromHex(element.sessionIds[i]);
        if (sessionId instanceof Error) {
          throw sessionId;
        }
        const priv = bufferFromHex(element.privKeys[i]);
        if (priv instanceof Error) {
          throw priv;
        }
        const privateKey = PrivateKey.fromBytes(priv);
        if (privateKey instanceof Error) {
          throw privateKey;
        }
        // when
        const sess = sessionInit(sessionId, privateKey, message, pkBuf, pkParity, ell, i);
        session.push(sess);
      }
      let noncesFromX: PublicKey[] = [];
      for (let index = 0; index < session.length; index++) {
        const element = session[index].nonce;
        const pubKey = pointFromX(element, BigInt(0));
        if (pubKey instanceof Error) {
          throw pubKey;
        }
        noncesFromX.push(new PublicKey(pubKey.x, pubKey.y));
      }
      const res = sessionNonceCombine(noncesFromX);

      for (let i = 0; i < session.length; i++) {
        // when
        const result = partialSignbipPlusbipGetE(
          message,
          res.R,
          new PublicKey(pubKeyCombined.x, pubKeyCombined.y),
          session[i].privKeyNonce,
          new PrivateKey(session[i].secretSessionKey),
          session[i].nonceParity,
          res.combinedNonceParity
        );
        // then
        strictEqual(bufferToHex(buffer32FromBigInt(result)), element.partialSigs[i]);
      }

      // then
    });
  });

  it('can partially verify all signatures starting with ' + Data[0].partialSigs[0], () => {
    Data.forEach(element => {
      let session: any[] = [];
      let points: PublicKey[] = [];
      element.pubKeys.forEach(pubkey => {
        const x = fromHex(pubkey);
        if (x instanceof Error) throw x;
        const point = pointFromX(toBigInt(x), BigInt(0));
        if (point instanceof Error) throw point;
        points.push(new PublicKey(point.x, point.y));
      });

      const pubKeyCombined = bipPubkeyCombine(points);
      const pkBuf = fromBigInt(pubKeyCombined.x);

      const pkParity = isEven(pubKeyCombined.y);

      let v: Uint8Array[] = [];
      for (const x of points) {
        v.push(buffer32FromBigInt(x.x));
      }
      const ell = bipCalculateL(v);
      const message = Buffer.from(element.message, 'hex');

      for (let i = 0; i < element.privKeys.length; i++) {
        const sessionId = bufferFromHex(element.sessionIds[i]);
        if (sessionId instanceof Error) {
          throw sessionId;
        }
        const priv = bufferFromHex(element.privKeys[i]);
        if (priv instanceof Error) {
          throw priv;
        }
        const privateKey = PrivateKey.fromBytes(priv);
        if (privateKey instanceof Error) {
          throw privateKey;
        }
        // when
        const sess = sessionInit(sessionId, privateKey, message, pkBuf, pkParity, ell, i);
        session.push(sess);
      }
      let noncesFromX: PublicKey[] = [];
      for (let index = 0; index < session.length; index++) {
        const element = session[index].nonce;
        const pubKey = pointFromX(element, BigInt(0));
        if (pubKey instanceof Error) {
          throw pubKey;
        }
        noncesFromX.push(new PublicKey(pubKey.x, pubKey.y));
      }
      const res = sessionNonceCombine(noncesFromX);

      for (let index = 0; index < element.partialSigs.length; index++) {
        const sig = bufferFromHex(element.partialSigs[index]);

        if (sig instanceof Error) throw sig;

        const cSig = toBigInt(sig);
        strictEqual(
          partialSigbipVerify(
            message,
            pubKeyCombined.x,
            cSig,
            res.R,
            index,
            points[index],
            noncesFromX[index],
            ell,
            pkParity,
            res.combinedNonceParity
          ),
          true
        );
      }
    });
  });

  it('can combine all partial signatures starting with and verify ' + Data[0].nonceCombined, () => {
    Data.forEach(element => {
      let session: any[] = [];
      let points: PublicKey[] = [];
      element.pubKeys.forEach(pubkey => {
        const x = fromHex(pubkey);
        if (x instanceof Error) throw x;
        const point = pointFromX(toBigInt(x), BigInt(0));
        if (point instanceof Error) throw point;
        points.push(new PublicKey(point.x, point.y));
      });

      const pubKeyCombined = bipPubkeyCombine(points);
      const pkBuf = fromBigInt(pubKeyCombined.x);

      const pkParity = isEven(pubKeyCombined.y);

      let v: Uint8Array[] = [];
      for (const x of points) {
        v.push(buffer32FromBigInt(x.x));
      }
      const ell = bipCalculateL(v);
      const message = Buffer.from(element.message, 'hex');

      for (let i = 0; i < element.privKeys.length; i++) {
        const sessionId = bufferFromHex(element.sessionIds[i]);
        if (sessionId instanceof Error) {
          throw sessionId;
        }
        const priv = bufferFromHex(element.privKeys[i]);
        if (priv instanceof Error) {
          throw priv;
        }
        const privateKey = PrivateKey.fromBytes(priv);
        if (privateKey instanceof Error) {
          throw privateKey;
        }
        // when
        const sess = sessionInit(sessionId, privateKey, message, pkBuf, pkParity, ell, i);
        session.push(sess);
      }
      let noncesFromX: PublicKey[] = [];

      for (let index = 0; index < session.length; index++) {
        const element = session[index].nonce;
        const pubKey = pointFromX(element, BigInt(0));
        if (pubKey instanceof Error) {
          throw pubKey;
        }
        noncesFromX.push(new PublicKey(pubKey.x, pubKey.y));
      }
      const result = sessionNonceCombine(noncesFromX);
      let sigs: bigint[] = [];
      for (let index = 0; index < element.partialSigs.length; index++) {
        const sig = bufferFromHex(element.partialSigs[index]);

        if (sig instanceof Error) throw sig;

        sigs.push(toBigInt(sig));
      }
      const combineSigs = partialSigCombine(result.R, sigs);
      strictEqual(
        bufferToHex(concatBuffers(buffer32FromBigInt(combineSigs.r), buffer32FromBigInt(combineSigs.s))),
        element.signature
      );
      strictEqual(verifyBip340(pubKeyCombined, message, combineSigs), true);
    });
  });
});
