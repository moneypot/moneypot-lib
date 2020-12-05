"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./util/assert");
const ecc = require("./util/ecc");
const bech32 = require("./util/bech32");
const serializedPrefix = 'bsmp'; // blinded signature moneypot
class BlindedSignature {
    constructor(s) {
        this.s = s;
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('BlindedSignature.fromPOD expected a string');
        }
        const { prefix, words } = bech32.decode(data);
        if (prefix !== serializedPrefix) {
            return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return BlindedSignature.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(bytes) {
        assert.equal(bytes.length, 32);
        const s = ecc.Scalar.fromBytes(bytes);
        if (s instanceof Error) {
            return s;
        }
        return new BlindedSignature(s);
    }
    verify(nonce, message, signer) {
        return ecc.blindVerify(this.s, nonce, message, signer);
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.s);
    }
    toPOD() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
exports.default = BlindedSignature;
//# sourceMappingURL=blinded-signature.js.map