"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = require("./util/ecc");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const bech32 = require("./util/bech32");
const wif = require("./util/wif");
const random_1 = require("./util/node-crypto/random");
const serializedPrefix = 'privhi'; // private key hookedin
class PrivateKey {
    static fromBech(str) {
        const { prefix, words } = bech32.decode(str);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return PrivateKey.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(bytes) {
        const s = ecc.Scalar.fromBytes(bytes);
        if (s instanceof Error) {
            return s;
        }
        return new PrivateKey(s);
    }
    static fromRand() {
        const buff = random_1.default(32);
        const s = ecc.Scalar.fromBytes(buff);
        if (s instanceof Error) {
            throw s; // should never really happen..
        }
        return new PrivateKey(s);
    }
    constructor(scalar) {
        this.scalar = scalar;
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.scalar);
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
    toPublicKey() {
        const point = ecc.Point.fromPrivKey(this.scalar);
        return new public_key_1.default(point.x, point.y);
    }
    tweak(n) {
        const newD = ecc.scalarAdd(this.scalar, n.scalar);
        return new PrivateKey(newD);
    }
    // Just for bitcoin compatibilty, shouldn't really be used...
    toWif(testnet = true) {
        const prefix = testnet ? 0xef : 0x80;
        return wif.encode(prefix, this.buffer, true);
    }
    derive(n) {
        const tweakBy = hash_1.default.fromMessage('derive', this.toPublicKey().buffer, n).buffer;
        const tweakByN = ecc.Scalar.fromBytes(tweakBy);
        if (tweakByN instanceof Error) {
            throw tweakByN;
        }
        const newD = ecc.scalarAdd(this.scalar, tweakByN);
        return new PrivateKey(newD);
    }
}
exports.default = PrivateKey;
//# sourceMappingURL=private-key.js.map