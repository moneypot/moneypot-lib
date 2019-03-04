"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
const hookin_1 = require("./hookin");
class SpentHookin {
    static fromPOD(data) {
        const spendAuthorization = signature_1.default.fromBech(data.spendAuthorization);
        if (spendAuthorization instanceof Error) {
            return spendAuthorization;
        }
        const hookin = hookin_1.default.fromPOD(data.hookin);
        if (hookin instanceof Error) {
            return hookin;
        }
        return new SpentHookin(hookin, spendAuthorization);
    }
    constructor(hookin, spendAuthorization) {
        this.hookin = hookin;
        this.spendAuthorization = spendAuthorization;
    }
    get amount() {
        return this.hookin.amount;
    }
    hash() {
        return this.hookin.hash();
    }
    toPOD() {
        return {
            hookin: this.hookin.toPOD(),
            spendAuthorization: this.spendAuthorization.toBech(),
        };
    }
}
exports.default = SpentHookin;
//# sourceMappingURL=spent-hookin.js.map