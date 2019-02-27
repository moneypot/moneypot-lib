import Signature from './signature';
import Hookin from './hookin';
export default class SpentHookin {
    static fromPOD(data) {
        const spendAuthorization = Signature.fromBech(data.spendAuthorization);
        if (spendAuthorization instanceof Error) {
            return spendAuthorization;
        }
        const hookin = Hookin.fromPOD(data.hookin);
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
    async hash() {
        return await this.hookin.hash();
    }
    toPOD() {
        return {
            hookin: this.hookin.toPOD(),
            spendAuthorization: this.spendAuthorization.toBech(),
        };
    }
}
//# sourceMappingURL=spent-hookin.js.map