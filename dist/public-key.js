"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const ecc = require("./util/ecc/elliptic");
const bech32 = require("./util/bech32");
const ripemd160_1 = require("./util/bcrypto/ripemd160");
const sha256_1 = require("./util/bcrypto/sha256");
const buffutils = require("./util/buffutils");
const serializedPrefix = 'pubhi'; // public key hookedin
class PublicKey {
    static fromBech(serialized) {
        const { prefix, words } = bech32.decode(serialized);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return PublicKey.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(serialized) {
        const point = ecc.Point.fromBytes(serialized);
        if (point instanceof Error) {
            return point;
        }
        return new PublicKey(point.x, point.y);
    }
    get buffer() {
        return ecc.Point.toBytes(this);
    }
    // dont directly use...
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
    tweak(n) {
        const newQ = ecc.pointAdd(this, n);
        return new PublicKey(newQ.x, newQ.y);
    }
    derive(n) {
        const tweakBy = hash_1.default.fromMessage('derive', this.buffer, n).buffer;
        const tweakByN = ecc.Scalar.fromBytes(tweakBy);
        if (tweakByN instanceof Error) {
            throw tweakByN;
        }
        const tweakPoint = ecc.Point.fromPrivKey(tweakByN);
        const newQ = ecc.pointAdd(this, tweakPoint);
        return new PublicKey(newQ.x, newQ.y);
    }
    hash() {
        return hash_1.default.fromMessage('PublicKey', this.buffer);
    }
    toBitcoinAddress(testnet = true) {
        const prefix = testnet ? 'tb' : 'bc';
        const pubkeyHash = rmd160sha256(this.buffer);
        const words = bech32.toWords(pubkeyHash);
        const version = new Uint8Array(1); // [0]
        return bech32.encode(prefix, buffutils.concat(version, words));
    }
}
exports.default = PublicKey;
function rmd160sha256(data) {
    return ripemd160_1.default.digest(sha256_1.default.digest(data));
}
//# sourceMappingURL=public-key.js.map