"use strict";
// This works very similar to bip32, except that it's not limited to 32 bit
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./util/assert");
const types = require("./util/types");
const crypto_1 = require("crypto");
const buffutils = require("./util/buffutils");
const ecc = require("./util/ecc");
const public_key_1 = require("./public-key");
const bs58check = require("./util/bs58check");
const rmd160_sha256_1 = require("./util/rmd160-sha256");
const wif = require("./util/wif");
function isNetworkType(net) {
    return types.isUint8(net.wif) && net.bip32 && types.isUint32(net.bip32.public) && types.isUint32(net.bip32.private);
}
function isBip32Path(path) {
    return path.match(/^(m\/)?(\d+'?\/)*\d+'?$/) !== null;
}
function isUInt31(v) {
    return Number.isInteger(v) && v >= 0 && v < 2 ** 32;
}
const HIGHEST_BIT = 0x80000000;
const BITCOIN = {
    wif: 0x80,
    bip32: {
        public: 0x4b24746,
        private: 0x4b2430c,
    },
};
function hmacSHA512(key, data) {
    return crypto_1.createHmac('sha512', key)
        .update(data)
        .digest();
}
class HDChain {
    get identifier() {
        return rmd160_sha256_1.default(this.publicKey);
    }
    get fingerprint() {
        return this.identifier.slice(0, 4);
    }
    get privateKeyScalar() {
        if (this.__d === null) {
            return null;
        }
        const sec = ecc.Scalar.fromBytes(this.__d);
        if (sec instanceof Error) {
            throw sec;
        }
        return sec;
    }
    get privateKey() {
        return this.__d;
    }
    get publicKeyPoint() {
        const point = ecc.Point.fromBytes(this.publicKey);
        if (point instanceof Error) {
            throw point;
        }
        return point;
    }
    get publicKey() {
        if (this.__Q !== null) {
            return this.__Q;
        }
        assert.equal(this.compressed, true);
        const q = ecc.Point.toBytes(ecc.Point.fromPrivKey(this.privateKeyScalar));
        this.__Q = q;
        return q;
    }
    static fromBase58(str, network = BITCOIN) {
        const buffer = Buffer.from(bs58check.decode(str));
        if (buffer.length !== 78) {
            throw new TypeError('Invalid buffer length');
        }
        const indexLength = buffer.length - 74;
        // 4 bytes: version bytes
        const version = buffer.readUInt32BE(0);
        if (version !== network.bip32.private && version !== network.bip32.public) {
            throw new TypeError('Invalid network version');
        }
        // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
        const depth = buffer[4];
        // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
        const parentFingerprint = buffer.readUInt32BE(5);
        if (depth === 0) {
            if (parentFingerprint !== 0x00000000) {
                throw new TypeError('Invalid parent fingerprint');
            }
        }
        // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
        // This is encoded in MSB order. (0x00000000 if master key)
        const index = buffer.readUInt32BE(9);
        if (depth === 0 && (indexLength !== 4 || index !== 0)) {
            throw new TypeError('Invalid index');
        }
        // 32 bytes: the chain code
        const chainCode = buffer.slice(13, 45);
        let hd;
        // 33 bytes: private key data (0x00 + k)
        if (version === network.bip32.private) {
            if (buffer.readUInt8(45) !== 0x00) {
                throw new TypeError('Invalid private key');
            }
            const k = buffer.slice(46, 78);
            hd = HDChain.fromPrivateKey(k, chainCode, network);
            // 33 bytes: public key data (0x02 + X or 0x03 + X)
        }
        else {
            const X = buffer.slice(45, 78);
            hd = HDChain.fromPublicKey(X, chainCode, network);
        }
        hd.depth = depth;
        hd.index = index;
        hd.parentFingerprint = parentFingerprint;
        return hd;
    }
    static fromPrivateKey(privateKey, chainCode, network = BITCOIN) {
        assert.check(types.isBuffer32, privateKey);
        assert.check(types.isBuffer32, chainCode);
        const sec = ecc.Scalar.fromBytes(privateKey);
        if (sec instanceof Error) {
            throw sec;
        }
        return new HDChain(privateKey, null, chainCode, network);
    }
    static fromPublicKey(publicKey, chainCode, network = BITCOIN) {
        assert.check(types.isBuffer33, publicKey);
        assert.check(types.isBuffer32, chainCode);
        // verify the X coordinate is a point on the curve
        const pub = ecc.Point.fromBytes(publicKey);
        if (pub instanceof Error) {
            throw pub;
        }
        return new HDChain(null, publicKey, chainCode, network);
    }
    static fromSeed(seed, network = BITCOIN) {
        if (seed.length < 16) {
            throw new TypeError('Seed should be at least 128 bits');
        }
        if (seed.length > 64) {
            throw new TypeError('Seed should be at most 512 bits');
        }
        const I = hmacSHA512('Bitcoin seed', seed);
        const IL = I.slice(0, 32);
        const IR = I.slice(32);
        return HDChain.fromPrivateKey(IL, IR, network);
    }
    constructor(d, Q, chainCode, network = BITCOIN) {
        assert.check(isNetworkType, network);
        assert.equal(d !== null || Q !== null, true);
        this.compressed = true;
        this.__d = d;
        this.__Q = Q;
        this.chainCode = chainCode;
        this.depth = 0;
        this.index = 0;
        this.network = network;
        this.parentFingerprint = 0x00000000;
    }
    toPublicKey() {
        return public_key_1.default.fromBytes(this.publicKey);
    }
    isNeutered() {
        return this.__d === null;
    }
    neutered() {
        const neutered = HDChain.fromPublicKey(this.publicKey, this.chainCode, this.network);
        neutered.depth = this.depth;
        neutered.index = this.index;
        neutered.parentFingerprint = this.parentFingerprint;
        return neutered;
    }
    toBase58() {
        const network = this.network;
        const version = !this.isNeutered() ? network.bip32.private : network.bip32.public;
        const buffer = new ArrayBuffer(78);
        const view = new DataView(buffer);
        const ba = new Uint8Array(buffer);
        // 4 bytes: version bytes
        view.setUint32(0, version);
        // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ....
        view.setUint8(4, this.depth);
        // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
        view.setUint32(5, this.parentFingerprint);
        // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
        // This is encoded in big endian. (0x00000000 if master key)
        view.setUint32(9, this.index);
        // 32 bytes: the chain code
        buffutils.copy(this.chainCode, ba, 13);
        // 33 bytes: the public key or private key data
        if (!this.isNeutered()) {
            // 0x00 + k for private keys
            view.setUint32(45, 0);
            buffutils.copy(this.privateKey, ba, 46);
            // 33 bytes: the public key
        }
        else {
            // X9.62 encoding for public keys
            buffutils.copy(this.publicKey, ba, 45);
        }
        return bs58check.encode(ba);
    }
    toWIF() {
        if (!this.privateKey) {
            throw new TypeError('Missing private key');
        }
        return wif.encode(this.network.wif, this.privateKey, true);
    }
    derive(index) {
        assert.check(types.isUint32, index);
        const isHardened = index >= HIGHEST_BIT;
        const data = Buffer.allocUnsafe(37);
        // Hardened child
        if (isHardened) {
            if (this.isNeutered()) {
                throw new TypeError('Missing private key for hardened child key');
            }
            // data = 0x00 || ser256(kpar) || ser32(index)
            data[0] = 0x00;
            buffutils.copy(this.privateKey, data, 1);
            data.writeUInt32BE(index, 33);
            // Normal child
        }
        else {
            // data = serP(point(kpar)) || ser32(index)
            //      = serP(Kpar) || ser32(index)
            buffutils.copy(this.publicKey, data, 0);
            data.writeUInt32BE(index, 33);
        }
        const I = hmacSHA512(this.chainCode, data);
        const IL = I.slice(0, 32);
        const IR = I.slice(32);
        const ILScalar = ecc.Scalar.fromBytes(IL);
        // if parse256(IL) >= n, proceed with the next value for i
        if (ILScalar instanceof Error) {
            return this.derive(index + 1);
        }
        // Private parent key -> private child key
        let hd;
        if (!this.isNeutered()) {
            // ki = parse256(IL) + kpar (mod n)
            const kiScalar = ecc.scalarAdd(this.privateKeyScalar, ILScalar);
            // In case ki == 0, proceed with the next value for i
            if (kiScalar === BigInt(0)) {
                return this.derive(index + 1);
            }
            const ki = ecc.Scalar.toBytes(kiScalar);
            hd = HDChain.fromPrivateKey(ki, IR, this.network);
            // Public parent key -> public child key
        }
        else {
            // Ki = point(parse256(IL)) + Kpar
            //    = G*IL + Kpar
            const KiScalar = ecc.pointAdd(this.publicKeyPoint, ecc.Point.fromPrivKey(ILScalar));
            const Ki = ecc.Point.toBytes(KiScalar);
            // In case Ki is the point at infinity, proceed with the next value for i
            // TODO: if (KiScalar === ...) { return this.derive(index + 1); }
            hd = HDChain.fromPublicKey(Ki, IR, this.network);
        }
        hd.depth = this.depth + 1;
        hd.index = index;
        hd.parentFingerprint = Buffer.from(this.fingerprint).readUInt32BE(0);
        return hd;
    }
    deriveHardened(index) {
        assert.check(isUInt31, index);
        // Only derives hardened private keys by default
        return this.derive(index + HIGHEST_BIT);
    }
    derivePath(path) {
        assert.check(isBip32Path, path);
        let splitPath = path.split('/');
        if (splitPath[0] === 'm') {
            if (this.parentFingerprint) {
                throw new TypeError('Expected master, got child');
            }
            splitPath = splitPath.slice(1);
        }
        return splitPath.reduce(function (prevHd, indexStr) {
            let index;
            if (indexStr.slice(-1) === "'") {
                index = parseInt(indexStr.slice(0, -1), 10);
                return prevHd.deriveHardened(index);
            }
            else {
                index = parseInt(indexStr, 10);
                return prevHd.derive(index);
            }
        }, this);
    }
}
exports.default = HDChain;
//# sourceMappingURL=hdchain.js.map