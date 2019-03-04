import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import SHA256 from './util/bcrypto/sha256';
import * as Buffutil from './util/buffutils';
const serializedPrefix = 'hshi'; // hash hookedin
export default class Hash {
    // actually hashes a message(s)
    static fromMessage(prefix, ...message) {
        const buff = SHA256.mac(Buffutil.fromString(prefix), Buffutil.concat(...message));
        return new Hash(buff);
    }
    static newBuilder(prefix) {
        // this can be optimized later:
        const parts = [];
        return new class {
            update(message) {
                parts.push(message);
            }
            digest() {
                return Hash.fromMessage(prefix, ...parts);
            }
        }();
    }
    static fromBech(serialized) {
        try {
            const { prefix, words } = bech32.decode(serialized);
            if (prefix !== serializedPrefix) {
                return new Error('hash.fromBech expected prefix: ' + serializedPrefix + ' but got ' + prefix);
            }
            const bytes = bech32.fromWords(words);
            return new Hash(bytes);
        }
        catch (err) {
            return err;
        }
    }
    constructor(buff) {
        assert.equal(buff.length, 32);
        this.buffer = buff;
    }
    toBech() {
        const words = bech32.toWords(this.buffer);
        return bech32.encode(serializedPrefix, words);
    }
}
//# sourceMappingURL=hash.js.map