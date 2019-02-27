import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import hmacSha512 from './util/browser-crypto/hmac-sha512';
import * as buffutils from './util/buffutils';
import Params from './params';
export default class Hookin {
    static fromPOD(data) {
        const txid = buffutils.fromHex(data.txid);
        const vout = data.vout;
        const amount = data.amount;
        const creditTo = PublicKey.fromBech(data.creditTo);
        if (creditTo instanceof Error) {
            return creditTo;
        }
        const deriveIndex = data.deriveIndex;
        return new Hookin(txid, vout, amount, creditTo, deriveIndex);
    }
    static hashOf(txid, vout, amount, creditTo, deriveIndex) {
        const b = Hash.newBuilder('Hookin');
        b.update(txid);
        b.update(buffutils.fromUint32(vout));
        b.update(buffutils.fromUint64(amount));
        b.update(creditTo.buffer);
        b.update(buffutils.fromUint32(deriveIndex));
        return b.digest();
    }
    constructor(txid, vout, amount, creditTo, deriveIndex) {
        this.txid = txid;
        this.vout = vout;
        this.amount = amount;
        this.creditTo = creditTo;
        this.deriveIndex = deriveIndex;
    }
    async hash() {
        return Hookin.hashOf(this.txid, this.vout, this.amount, this.creditTo, this.deriveIndex);
    }
    async getTweak() {
        const message = buffutils.concat(Params.fundingPublicKey.buffer, buffutils.fromUint32(this.deriveIndex));
        const I = await hmacSha512((await this.creditTo.hash()).buffer, message);
        const IL = I.slice(0, 32);
        const pk = PrivateKey.fromBytes(IL);
        if (pk instanceof Error) {
            throw pk;
        }
        return pk;
    }
    toPOD() {
        return {
            amount: this.amount,
            creditTo: this.creditTo.toBech(),
            deriveIndex: this.deriveIndex,
            txid: buffutils.toHex(this.txid),
            vout: this.vout,
        };
    }
}
//# sourceMappingURL=hookin.js.map