import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import * as Buffutils from './util/buffutils';
import * as ecc from './util/ecc';
const serializedPrefix = 'sighi'; // signature hookedin
export default class Signature {
    // actually creates a schnorr sig. This takes a message, not a hash to prevent existential forgeries
    static compute(message, privkey) {
        const sig = ecc.sign(message, privkey.scalar);
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
//# sourceMappingURL=signature.js.map