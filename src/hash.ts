import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import hmacSha256 from './util/node-crypto/hmac-sha256';
import * as Buffutil from './util/buffutils';

const serializedPrefix = 'hshi'; // hash hookedin

export default class Hash {
  // actually hashes a message(s)
  public static async fromMessage(prefix: string, ...message: Uint8Array[]): Promise<Hash> {
    const buff = await hmacSha256(Buffutil.fromString(prefix), Buffutil.concat(...message));
    return new Hash(buff);
  }

  public static newBuilder(prefix: string) {
    // this can be optimized later:
    const parts: Uint8Array[] = [];

    return new class {
      public update(message: Uint8Array) {
        parts.push(message);
      }

      public digest() {
        return Hash.fromMessage(prefix, ...parts);
      }
    }();
  }

  public static fromBech(serialized: string): Hash | Error {
    try {
      const { prefix, words } = bech32.decode(serialized);

      if (prefix !== serializedPrefix) {
        return new Error('hash.fromBech expected prefix: ' + serializedPrefix + ' but got ' + prefix);
      }

      const bytes = bech32.fromWords(words);
      return new Hash(bytes);
    } catch (err) {
      return err;
    }
  }
  public buffer: Uint8Array;

  constructor(buff: Uint8Array) {
    assert.equal(buff.length, 32);
    this.buffer = buff;
  }

  public toBech() {
    const words = bech32.toWords(this.buffer);
    return bech32.encode(serializedPrefix, words);
  }
}
