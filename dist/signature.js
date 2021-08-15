"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("./util/assert"));
const bech32 = __importStar(require("./util/bech32"));
const Buffutils = __importStar(require("./util/buffutils"));
const ecc = __importStar(require("./util/ecc"));
const serializedPrefix = 'sigmp'; // signature moneypot
class Signature {
    constructor(r, s) {
        this.r = r;
        this.s = s;
    }
    // actually creates a schnorr sig. This takes a message, not a hash to prevent existential forgeries
    static compute(message, privkey) {
        const sig = ecc.sign(message, privkey.scalar);
        return new Signature(sig.r, sig.s);
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('Signature.fromPOD expected string');
        }
        const { prefix, words } = bech32.decode(data);
        if (prefix !== serializedPrefix) {
            return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return Signature.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(bytes) {
        assert.equal(bytes.length, 64);
        const r = ecc.Scalar.fromBytes(bytes.slice(0, 32));
        if (r instanceof Error) {
            return r;
        }
        const s = ecc.Scalar.fromBytes(bytes.slice(32, 64));
        if (s instanceof Error) {
            return s;
        }
        return new Signature(r, s);
    }
    get buffer() {
        return Buffutils.concat(ecc.Scalar.toBytes(this.r), ecc.Scalar.toBytes(this.s));
    }
    verify(message, pubkey) {
        return ecc.verify(pubkey, message, this);
    }
    verifyECDSA(message, pubkey) {
        return ecc.verifyECDSA(pubkey, message, this);
    }
    toPOD() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
exports.default = Signature;
//# sourceMappingURL=signature.js.map