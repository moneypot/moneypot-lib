"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./util/assert");
const bech32 = require("./util/bech32");
const sha256_1 = require("./util/bcrypto/sha256");
const Buffutil = require("./util/buffutils");
const serializedPrefix = 'hshi'; // hash hookedin
class Hash {
    // actually hashes a message(s)
    static fromMessage(prefix, ...message) {
        const buff = sha256_1.default.mac(Buffutil.fromString(prefix), Buffutil.concat(...message));
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
exports.default = Hash;
//# sourceMappingURL=hash.js.map