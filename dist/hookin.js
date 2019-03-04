"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const private_key_1 = require("./private-key");
const public_key_1 = require("./public-key");
const hmac_sha512_1 = require("./util/browser-crypto/hmac-sha512");
const buffutils = require("./util/buffutils");
const params_1 = require("./params");
class Hookin {
    static fromPOD(data) {
        const txid = buffutils.fromHex(data.txid);
        const vout = data.vout;
        const amount = data.amount;
        const creditTo = public_key_1.default.fromBech(data.creditTo);
        if (creditTo instanceof Error) {
            return creditTo;
        }
        const deriveIndex = data.deriveIndex;
        return new Hookin(txid, vout, amount, creditTo, deriveIndex);
    }
    static hashOf(txid, vout, amount, creditTo, deriveIndex) {
        const b = hash_1.default.newBuilder('Hookin');
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
    hash() {
        return Hookin.hashOf(this.txid, this.vout, this.amount, this.creditTo, this.deriveIndex);
    }
    async getTweak() {
        const message = buffutils.concat(params_1.default.fundingPublicKey.buffer, buffutils.fromUint32(this.deriveIndex));
        const I = await hmac_sha512_1.default((await this.creditTo.hash()).buffer, message);
        const IL = I.slice(0, 32);
        const pk = private_key_1.default.fromBytes(IL);
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
exports.default = Hookin;
//# sourceMappingURL=hookin.js.map