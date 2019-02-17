import * as assert from './util/assert';
import * as ecc from './util/ecc';
import * as bech32 from './util/bech32';

const serializedPrefix = 'bshi'; // blinded signature hookedin

export default class BlindedSignature {
  public static fromBech(str: string) {
    const { prefix, words } = bech32.decode(str);

    if (prefix !== serializedPrefix) {
      throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return BlindedSignature.fromBytes(bech32.fromWords(words));
  }

  public static fromBytes(bytes: Uint8Array): BlindedSignature | Error {
    assert.equal(bytes.length, 32);
    const s = ecc.Scalar.fromBytes(bytes);
    if (s instanceof Error) {
      return s;
    }

    return new BlindedSignature(s);
  }

  public s: ecc.Scalar;

  constructor(s: ecc.Scalar) {
    this.s = s;
  }

  get buffer(): Uint8Array {
    return ecc.Scalar.toBytes(this.s);
  }

  public toBech() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }
}
