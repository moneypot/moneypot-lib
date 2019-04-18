import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import SHA256 from './util/bcrypto/sha256';
import * as Buffutil from './util/buffutils';

const serializedPrefix = 'hshi'; // hash hookedin

export default class Hash {
  // actually hashes a message(s)
  public static fromMessage(prefix: string, ...message: Uint8Array[]): Hash {
    const buff = SHA256.mac(Buffutil.fromString(prefix), Buffutil.concat(...message));
    return new Hash(buff);
  }

  public static newBuilder(prefix: string) {
    // this can be optimized later:
    const parts: Uint8Array[] = [];

    return new (class {
      public update(message: Uint8Array) {
        parts.push(message);
      }

      public digest() {
        return Hash.fromMessage(prefix, ...parts);
      }
    })();
  }

  public static fromPOD(data: any): Hash | Error {
    if (typeof data !== 'string') {
      return new Error('Hash.fromPOD expected string');
    }
    const { prefix, words } = bech32.decode(data);

    if (prefix !== serializedPrefix) {
      return new Error('hash.fromPOD expected prefix: ' + serializedPrefix + ' but got ' + prefix);
    }

    const bytes = bech32.fromWords(words);
    return new Hash(bytes);
  }
  public buffer: Uint8Array;

  constructor(buff: Uint8Array) {
    assert.equal(buff.length, 32);
    this.buffer = buff;
  }

  public toPOD() {
    const words = bech32.toWords(this.buffer);
    return bech32.encode(serializedPrefix, words);
  }
}
