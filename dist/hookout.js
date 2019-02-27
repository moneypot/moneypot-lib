import * as POD from './pod';
import * as Buffutils from './util/buffutils';
import Hash from './hash';
import * as assert from './util/assert';
export default class Hookout {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('Hookout.fromPOD is not object');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('Hookout.fromPOD invalid amount');
        }
        const bitcoinAddress = data.bitcoinAddress;
        if (typeof bitcoinAddress !== 'string') {
            return new Error('Hookout.fromPOD invalid bitcoin address');
        }
        const immediate = data.immediate;
        if (typeof immediate !== 'boolean') {
            return new Error('Hookout.fromPOD invalid immediate');
        }
        const nonce = Buffutils.fromHex(data.nonce);
        if (nonce.length !== 32) {
            return new Error('Hookout.fromPOD invalid nonce');
        }
        return new Hookout(amount, bitcoinAddress, immediate, nonce);
    }
    constructor(amount, bitcoinAddress, immediate, nonce) {
        this.amount = amount;
        this.bitcoinAddress = bitcoinAddress;
        this.immediate = immediate;
        assert.equal(nonce.length, 32);
        this.nonce = nonce;
    }
    toPOD() {
        return {
            amount: this.amount,
            bitcoinAddress: this.bitcoinAddress,
            immediate: this.immediate,
            nonce: Buffutils.toHex(this.nonce),
        };
    }
    hash() {
        const h = Hash.newBuilder('Hookout');
        h.update(Buffutils.fromUint64(this.amount));
        h.update(Buffutils.fromString(this.bitcoinAddress));
        h.update(Buffutils.fromUint8(this.immediate ? 1 : 0));
        h.update(this.nonce);
        return h.digest();
    }
}
//# sourceMappingURL=hookout.js.map