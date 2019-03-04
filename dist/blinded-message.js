import * as assert from './util/assert';
import * as bech32 from './util/bech32';
import * as ecc from './util/ecc/index';
const serializedPrefix = 'bmhi'; // blinded message hookedin
export default class BlindedMessage {
    static fromBech(str) {
        assert.equal(typeof str, 'string');
        const { prefix, words } = bech32.decode(str);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
        }
        return BlindedMessage.fromBytes(bech32.fromWords(words));
    }
    static fromBytes(bytes) {
        const c = ecc.Scalar.fromBytes(bytes);
        if (c instanceof Error) {
            return c;
        }
        return new BlindedMessage(c);
    }
    constructor(challenge) {
        this.c = challenge;
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.c);
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
}
//# sourceMappingURL=blinded-message.js.map