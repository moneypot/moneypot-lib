"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = __importStar(require("./util/ecc"));
const hash_1 = __importDefault(require("./hash"));
const public_key_1 = __importDefault(require("./public-key"));
const bech32 = __importStar(require("./util/bech32"));
const wif = __importStar(require("./util/wif"));
const random_1 = __importDefault(require("./util/random"));
const Buffutils = __importStar(require("./util/buffutils"));
const mu_sig_1 = require("./util/ecc/mu-sig");
const serializedPrefix = 'privmp'; // private key moneypot
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
    static combine(privkeys) {
        return new PrivateKey(mu_sig_1.privkeyCombine(privkeys.map(p => p.scalar)));
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.scalar);
    }
    toPOD() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
    // in BIP340 we should curve.p - Y if Y is uneven and scrap even uneven markers TODO?
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