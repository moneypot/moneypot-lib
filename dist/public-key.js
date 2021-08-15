"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = __importDefault(require("./hash"));
const ecc = __importStar(require("./util/ecc/elliptic"));
const bech32 = __importStar(require("./util/bech32"));
const ripemd160_1 = __importDefault(require("./util/bcrypto/ripemd160"));
const sha256_1 = __importDefault(require("./util/bcrypto/sha256"));
const buffutils = __importStar(require("./util/buffutils"));
const mu_sig_1 = require("./util/ecc/mu-sig");
const base58_1 = require("./util/base58");
const serializedPrefix = 'pubmp'; // public key moneypot
class PublicKey {
    // dont directly use...
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('PublicKey.fromPOD expected a string');
        }
        const { prefix, words } = bech32.decode(data);
        if (prefix !== serializedPrefix) {
            return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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
    static combine(pubkeys) {
        const t = mu_sig_1.pubkeyCombine(pubkeys);
        return new PublicKey(t.x, t.y);
    }
    get buffer() {
        return ecc.Point.toBytes(this);
    }
    toPOD() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
    tweak(n) {
        const newQ = ecc.pointAdd(this, n);
        return new PublicKey(newQ.x, newQ.y);
    }
    derive(n) {
        let nBuff;
        if (n instanceof Uint8Array) {
            nBuff = n;
        }
        else if (typeof n === 'bigint') {
            nBuff = buffutils.fromBigInt(n);
        }
        else if (typeof n === 'number') {
            nBuff = buffutils.fromVarInt(n);
        }
        else {
            throw new Error('unexpected type for deriving with. must be a Uint8Array | number | bigint');
        }
        const tweakBy = hash_1.default.fromMessage('derive', this.buffer, nBuff).buffer;
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
    // the pubkeys are the custodians fundingkeys. we don't tweak like we do with normal addresses
    toMultisig(testnet = true, pubkeys, redeemReq) {
        const prefix = testnet ? 'tb' : 'bc';
        // OP_RESERVED =
        const OP_INT_BASE = 80;
        // OP_CHECKMULTISIG =
        const OP_CHECKMULTISIG = 174;
        // M (n - x)
        const U = buffutils.fromUint8(OP_INT_BASE + redeemReq);
        // N
        const R = buffutils.fromUint8(OP_INT_BASE + pubkeys.length + 1);
        const redeem = buffutils.concat(U, new Uint8Array([33]), this.buffer, ...pubkeys.map(pk => buffutils.concat(new Uint8Array([33]), pk.buffer)), R, buffutils.fromUint8(OP_CHECKMULTISIG));
        const hashRedeem = sha256_1.default.digest(redeem);
        const words = bech32.toWords(hashRedeem);
        const version = new Uint8Array(1); // [0]
        return bech32.encode(prefix, buffutils.concat(version, words));
    }
    toNestedBitcoinAddress(testnet = true) {
        const prefix = testnet ? 0xc4 : 0x05;
        const pubkeyHash = rmd160sha256(this.buffer);
        // redeem script
        const redeem = rmd160sha256(buffutils.concat(new Uint8Array([0x00, 0x14]), pubkeyHash));
        // const rmdsha =  rmd160sha256(redeem)
        const addbytes = buffutils.concat(new Uint8Array([prefix]), redeem);
        const sha2 = sha256_1.default.digest(sha256_1.default.digest(addbytes)).slice(0, 4);
        // const checksum = sha2.slice(0, 4)
        const binary = buffutils.concat(addbytes, sha2);
        return base58_1.encode(binary);
    }
    toLegacyBitcoinAddress(testnet = false) {
        const prefix = testnet ? 0x6f : 0x00;
        const hash = rmd160sha256(this.buffer);
        const concatVersion = buffutils.concat(new Uint8Array([prefix]), hash);
        const sha = sha256_1.default.digest(sha256_1.default.digest(concatVersion)).slice(0, 4);
        const enc = buffutils.concat(concatVersion, sha);
        return base58_1.encode(enc);
    }
}
exports.default = PublicKey;
function rmd160sha256(data) {
    return ripemd160_1.default.digest(sha256_1.default.digest(data));
}
//# sourceMappingURL=public-key.js.map