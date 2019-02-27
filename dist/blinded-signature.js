import * as assert from './util/assert';
import * as ecc from './util/ecc';
import * as bech32 from './util/bech32';
const serializedPrefix = 'bshi'; // blinded signature hookedin
export default class BlindedSignature {
    static fromBech(str) {
        const { prefix, words } = bech32.decode(str);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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
    constructor(s) {
        this.s = s;
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.s);
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
//# sourceMappingURL=blinded-signature.js.map