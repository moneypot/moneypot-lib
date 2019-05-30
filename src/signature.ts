import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import * as Buffutils from './util/buffutils';
import * as ecc from './util/ecc';

import PrivateKey from './private-key';
import PublicKey from './public-key';
import Hash from './hash';

const serializedPrefix = 'sighi'; // signature hookedin

export default class Signature {
  // actually creates a schnorr sig. This takes a message, not a hash to prevent existential forgeries
  public static compute(message: Hash, privkey: PrivateKey) {
    const sig = ecc.sign(message.buffer, privkey.scalar);
    return new Signature(sig.r, sig.s);
  }

  public static computeMu(message: Hash, privkeys: PrivateKey[]) {
    const sig = ecc.muSig.signNoninteractively(privkeys.map(p => p.scalar), message.buffer);
    return new Signature(sig.r, sig.s);
  }

  public static fromPOD(data: any): Signature | Error {
    if (typeof data !== 'string') {
      return new Error('Signature.fromPOD expected string');
    }

    const { prefix, words } = bech32.decode(data);

    if (prefix !== serializedPrefix) {
      return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return Signature.fromBytes(bech32.fromWords(words));
  }

  public static fromBytes(bytes: Uint8Array): Signature | Error {
    assert.equal(bytes.length, 64);

    const r = ecc.Scalar.fromBytes(bytes.slice(0, 32));
    if (r instanceof Error) {
      return r;
    }

    const s = ecc.Scalar.fromBytes(bytes.slice(32, 64));
    if (s instanceof Error) {
      return s;
    }

    return new Signature(r, s);
  }

  public r: ecc.Scalar;
  public s: ecc.Scalar;

  constructor(r: ecc.Scalar, s: ecc.Scalar) {
    this.r = r;
    this.s = s;
  }

  get buffer(): Uint8Array {
    return Buffutils.concat(ecc.Scalar.toBytes(this.r), ecc.Scalar.toBytes(this.s));
  }

  public verify(message: Hash, pubkey: PublicKey) {
    return ecc.verify(pubkey, message.buffer, this);
  }

  public toPOD() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }
}
