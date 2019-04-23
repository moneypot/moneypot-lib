"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const hash_1 = require("./hash");
class Custodian {
    constructor(acknowledgementKey, fundingKey, blindCoinKeys) {
        this.acknowledgementKey = acknowledgementKey;
        this.fundingKey = fundingKey;
        this.blindCoinKeys = blindCoinKeys;
    }
    hash() {
        return hash_1.default.fromMessage('Custodian', this.acknowledgementKey.buffer, this.fundingKey.buffer, ...this.blindCoinKeys.map(bk => bk.buffer));
    }
    toPOD() {
        return {
            acknowledgementKey: this.acknowledgementKey.toPOD(),
            fundingKey: this.fundingKey.toPOD(),
            blindCoinKeys: this.blindCoinKeys.map(bk => bk.toPOD()),
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
        const fundingKey = public_key_1.default.fromPOD(d.fundingKey);
        if (fundingKey instanceof Error) {
            return fundingKey;
        }
        if (Array.isArray(d.blindCoinKeys) || d.blindCoinKeys.length !== 31) {
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
        return new Custodian(acknowledgementKey, fundingKey, blindCoinKeys);
    }
}
exports.default = Custodian;
//# sourceMappingURL=custodian.js.map