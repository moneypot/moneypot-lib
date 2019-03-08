"use strict";
/*
  An address is just a trivial wrapper around a public key. The main point is just to make sure it's used correctly
  (e.g. you can only send to an address). And we'll do versioning here when the time comes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const bech32 = require("./util/bech32");
const serializedPrefix = 'hia'; // hookedin address
class Address {
    static fromBech(serialized) {
        const { prefix, words } = bech32.decode(serialized);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return public_key_1.default.fromBytes(bech32.fromWords(words));
    }
    constructor(pub) {
        this.publicKey = pub;
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.publicKey.buffer));
    }
}
exports.default = Address;
//# sourceMappingURL=address.js.map