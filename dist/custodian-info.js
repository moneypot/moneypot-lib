"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const hash_1 = require("./hash");
const bech32 = require("./util/bech32");
const Buffutils = require("./util/buffutils");
const signature_1 = require("./signature");
class CustodianInfo {
    constructor(acknowledgementKey, currency, fundingKey, blindCoinKeys, wipeDate, wipeDateSig) {
        this.acknowledgementKey = acknowledgementKey;
        this.currency = currency;
        this.fundingKey = fundingKey;
        this.blindCoinKeys = blindCoinKeys;
        this.wipeDateSig = wipeDateSig;
        this.wipeDate = wipeDate;
    }
    hash() {
        return hash_1.default.fromMessage('Custodian', this.acknowledgementKey.buffer, Buffutils.fromUint32(this.currency.length), Buffutils.fromString(this.currency), this.fundingKey.buffer, ...this.blindCoinKeys.map(bk => bk.buffer));
    }
    // 4 letter code for using in an Address
    prefix() {
        const hash = this.hash().buffer;
        return (bech32.ALPHABET[hash[0] % 32] +
            bech32.ALPHABET[hash[1] % 32] +
            bech32.ALPHABET[hash[2] % 32] +
            bech32.ALPHABET[hash[3] % 32]);
    }
    toPOD() {
        return {
            acknowledgementKey: this.acknowledgementKey.toPOD(),
            currency: this.currency,
            fundingKey: this.fundingKey.toPOD(),
            blindCoinKeys: this.blindCoinKeys.map(bk => bk.toPOD()),
            wipeDate: this.wipeDate,
            wipeDateSig: this.wipeDateSig
        };
    }
    static fromPOD(d) {
        if (typeof d !== 'object') {
            return new Error('custodian fromPOD expected an object');
        }
        const acknowledgementKey = public_key_1.default.fromPOD(d.acknowledgementKey);
        if (acknowledgementKey instanceof Error) {
            return acknowledgementKey;
        }
        const currency = d.currency;
        if (typeof currency !== 'string') {
            return new Error('custodian expected a stringified currency');
        }
        const fundingKey = public_key_1.default.fromPOD(d.fundingKey);
        if (fundingKey instanceof Error) {
            return fundingKey;
        }
        if (!Array.isArray(d.blindCoinKeys) || d.blindCoinKeys.length !== 31) {
            return new Error('custodian expected an 31-length array for blindCoinKeys');
        }
        const blindCoinKeys = [];
        for (const bkstr of d.blindCoinKeys) {
            const bk = public_key_1.default.fromPOD(bkstr);
            if (bk instanceof Error) {
                return bk;
            }
            blindCoinKeys.push(bk);
        }
        // doesn't force a type..
        const wipeDate = d.wipeDate;
        if (wipeDate) {
            if (typeof wipeDate !== 'string') {
                return new Error('Invalid format used for the date.');
            }
        }
        const wipeDateSig = d.wipeDateSig;
        if (wipeDateSig) {
            const sig = signature_1.default.fromPOD(wipeDateSig);
            if (sig instanceof Error) {
                return sig;
            }
        }
        return new CustodianInfo(acknowledgementKey, currency, fundingKey, blindCoinKeys, wipeDate, wipeDateSig);
    }
}
exports.default = CustodianInfo;
//# sourceMappingURL=custodian-info.js.map