"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./util/assert");
const bech32 = require("./util/bech32");
const ecc = require("./util/ecc/index");
const serializedPrefix = 'bmhi'; // blinded message hookedin
class BlindedMessage {
    static fromBech(str) {
        assert.equal(typeof str, 'string');
        const { prefix, words } = bech32.decode(str);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return BlindedMessage.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(bytes) {
        const c = ecc.Scalar.fromBytes(bytes);
        if (c instanceof Error) {
            return c;
        }
        return new BlindedMessage(c);
    }
    constructor(challenge) {
        this.c = challenge;
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.c);
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
exports.default = BlindedMessage;
//# sourceMappingURL=blinded-message.js.map