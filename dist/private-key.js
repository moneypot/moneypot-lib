"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = require("./util/ecc");
const hash_1 = require("./hash");
const public_key_1 = require("./public-key");
const bech32 = require("./util/bech32");
const wif = require("./util/wif");
const random_1 = require("./util/random");
const Buffutils = require("./util/buffutils");
const serializedPrefix = 'privhi'; // private key hookedin
class PrivateKey {
    constructor(scalar) {
        this.scalar = scalar;
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('PrivateKey.fromPOD expected a string');
        }
        const { prefix, words } = bech32.decode(data);
        if (prefix !== serializedPrefix) {
            return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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
    get buffer() {
        return ecc.Scalar.toBytes(this.scalar);
    }
    toPOD() {
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
        let nBuff;
        if (n instanceof Uint8Array) {
            nBuff = n;
        }
        else if (typeof n === 'bigint') {
            nBuff = Buffutils.fromBigInt(n);
        }
        else if (typeof n === 'number') {
            nBuff = Buffutils.fromVarInt(n);
        }
        else {
            throw new Error('unexpected type for deriving with. must be a Uint8Array | number | bigint');
        }
        const tweakBy = hash_1.default.fromMessage('derive', this.toPublicKey().buffer, nBuff).buffer;
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