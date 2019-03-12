"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const private_key_1 = require("./private-key");
const public_key_1 = require("./public-key");
const sha512_1 = require("./util/bcrypto/sha512");
const POD = require("./pod");
const buffutils = require("./util/buffutils");
const params_1 = require("./params");
class Hookin {
    static fromPOD(data) {
        if (typeof data !== 'object') {
            return new Error('hookin expected an object');
        }
        const txid = buffutils.fromHex(data.txid, 32);
        if (txid instanceof Error) {
            return txid;
        }
        const vout = data.vout;
        if (!Number.isSafeInteger(vout) || vout < 0 || vout > 65536) {
            return new Error("hookin was given an invalid vout");
        }
        const amount = data.amount;
        if (POD.isAmount(amount)) {
            return new Error("invalid amount for hookin");
        }
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
    getTweak() {
        const message = buffutils.concat(params_1.default.fundingPublicKey.buffer, buffutils.fromUint32(this.deriveIndex));
        const I = sha512_1.default.mac(this.creditTo.hash().buffer, message);
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