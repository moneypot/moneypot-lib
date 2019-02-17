import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import { createHmac } from 'crypto';

const serializedPrefix = 'hshi'; // hash hookedin

export default class Hash {
  // actually hashes a message(s)
  public static fromMessage(prefix: string, ...message: Uint8Array[]) {
    const h = createHmac('sha256', prefix);

    for (const m of message) {
      h.update(m);
    }

    return new Hash(h.digest());
  }

  public static newBuilder(prefix: string) {
    const h = createHmac('sha256', prefix);

    return new class {
      public update(message: Uint8Array) {
        h.update(message);
      }

      public digest() {
        return new Hash(h.digest());
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
