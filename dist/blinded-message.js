"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bech32 = require("./util/bech32");
const ecc = require("./util/ecc/index");
const serializedPrefix = 'bmmp'; // blinded message moneypot
class BlindedMessage {
    constructor(challenge) {
        this.c = challenge;
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('BlindedMessage.fromPOD expected a string');
        }
        const { prefix, words } = bech32.decode(data);
        if (prefix !== serializedPrefix) {
            return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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
    get buffer() {
        return ecc.Scalar.toBytes(this.c);
    }
    toPOD() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
exports.default = BlindedMessage;
//# sourceMappingURL=blinded-message.js.map