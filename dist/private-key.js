import * as ecc from './util/ecc';
import Hash from './hash';
import PublicKey from './public-key';
import * as bech32 from './util/bech32';
import * as wif from './util/wif';
import random from './util/random';
const serializedPrefix = 'privhi'; // private key hookedin
export default class PrivateKey {
    static fromBech(str) {
        const { prefix, words } = bech32.decode(str);
        if (prefix !== serializedPrefix) {
            throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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
        const buff = random(32);
        const s = ecc.Scalar.fromBytes(buff);
        if (s instanceof Error) {
            throw s; // should never really happen..
        }
        return new PrivateKey(s);
    }
    constructor(scalar) {
        this.scalar = scalar;
    }
    get buffer() {
        return ecc.Scalar.toBytes(this.scalar);
    }
    toBech() {
        return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
    }
    toPublicKey() {
        const point = ecc.Point.fromPrivKey(this.scalar);
        return new PublicKey(point.x, point.y);
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
        const tweakBy = Hash.fromMessage('derive', this.toPublicKey().buffer, n).buffer;
        const tweakByN = ecc.Scalar.fromBytes(tweakBy);
        if (tweakByN instanceof Error) {
            throw tweakByN;
        }
        const newD = ecc.scalarAdd(this.scalar, tweakByN);
        return new PrivateKey(newD);
    }
}
//# sourceMappingURL=private-key.js.map