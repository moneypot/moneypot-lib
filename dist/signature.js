"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./util/assert");
const bech32 = require("./util/bech32");
const Buffutils = require("./util/buffutils");
const ecc = require("./util/ecc");
const serializedPrefix = 'sighi'; // signature hookedin
class Signature {
    // actually creates a schnorr sig. This takes a message, not a hash to prevent existential forgeries
    static compute(message, privkey) {
        const sig = ecc.sign(message, privkey.scalar);
        return new Signature(sig.r, sig.s);
    }
    static computeMu(message, privkeys) {
        const sig = ecc.muSig.signNoninteractively(privkeys.map(p => p.scalar), message);
        return new Signature(sig.r, sig.s);
    }
    static fromBech(serialized) {
        const { prefix, words } = bech32.decode(serialized);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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
    constructor(r, s) {
        this.r = r;
        this.s = s;
    }
    get buffer() {
        return Buffutils.concat(ecc.Scalar.toBytes(this.r), ecc.Scalar.toBytes(this.s));
    }
    verify(message, pubkey) {
        return ecc.verify(pubkey, message, this);
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
exports.default = Signature;
//# sourceMappingURL=signature.js.map