import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import * as ecc from './util/ecc/index';

const serializedPrefix = 'bmhi'; // blinded message hookedin

export default class BlindedMessage {
  public static fromBech(str: string) {
    assert.equal(typeof str, 'string');

    const { prefix, words } = bech32.decode(str);

    if (prefix !== serializedPrefix) {
      throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return BlindedMessage.fromBytes(bech32.fromWords(words));
  }

  public static fromBytes(bytes: Uint8Array): BlindedMessage | Error {
    const c = ecc.Scalar.fromBytes(bytes);
    if (c instanceof Error) {
      return c;
    }
    return new BlindedMessage(c);
  }

  public c: ecc.Scalar;

  constructor(challenge: ecc.Scalar) {
    this.c = challenge;
  }

  get buffer(): Uint8Array {
    return ecc.Scalar.toBytes(this.c);
  }

  public toBech(): string {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }
}
