"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./util/assert");
const bech32 = require("./util/bech32");
const crypto_1 = require("crypto");
const serializedPrefix = 'hshi'; // hash hookedin
class Hash {
    // actually hashes a message(s)
    static fromMessage(prefix, ...message) {
        const h = crypto_1.createHmac('sha256', prefix);
        for (const m of message) {
            h.update(m);
        }
        return new Hash(h.digest());
    }
    static newBuilder(prefix) {
        const h = crypto_1.createHmac('sha256', prefix);
        return new class {
            update(message) {
                h.update(message);
            }
            digest() {
                return new Hash(h.digest());
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