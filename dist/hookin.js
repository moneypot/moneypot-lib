"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = __importDefault(require("./hash"));
const private_key_1 = __importDefault(require("./private-key"));
const public_key_1 = __importDefault(require("./public-key"));
const POD = __importStar(require("./pod"));
const buffutils = __importStar(require("./util/buffutils"));
class Hookin {
    constructor(txid, vout, amount, claimant, bitcoinAddress, initCreated) {
        this.txid = txid;
        this.vout = vout;
        this.amount = amount;
        this.claimant = claimant;
        this.bitcoinAddress = bitcoinAddress;
        this.initCreated = initCreated;
    }
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
            return new Error('hookin was given an invalid vout');
        }
        const amount = data.amount;
        if (!POD.isAmount(amount)) {
            return new Error('invalid amount for hookin');
        }
        const claimant = public_key_1.default.fromPOD(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        const bitcoinAddress = data.bitcoinAddress;
        if (typeof bitcoinAddress !== 'string') {
            return new Error('hookin expected a bitcoin address');
        }
        const initCreated = data.initCreated;
        if (initCreated) {
            if (typeof initCreated != 'number') {
                throw initCreated;
            }
        }
        return new Hookin(txid, vout, amount, claimant, bitcoinAddress, initCreated);
    }
    static hashOf(txid, vout, amount, claimant, bitcoinAddress) {
        const b = hash_1.default.newBuilder('Hookin');
        b.update(txid);
        b.update(buffutils.fromUint32(vout));
        b.update(buffutils.fromUint64(amount));
        b.update(claimant.buffer);
        b.update(buffutils.fromString(bitcoinAddress));
        return b.digest();
    }
    hash() {
        return Hookin.hashOf(this.txid, this.vout, this.amount, this.claimant, this.bitcoinAddress);
    }
    get kind() {
        return 'Hookin';
    }
    get claimableAmount() {
        // a hookin by itself has no claimable value, it's only after we have some status updates for it being sufficiently confirmed
        return 0;
    }
    getTweak() {
        const bytes = hash_1.default.fromMessage('tweak', this.claimant.buffer).buffer;
        const pk = private_key_1.default.fromBytes(bytes);
        if (pk instanceof Error) {
            throw pk;
        }
        return pk;
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            amount: this.amount,
            claimant: this.claimant.toPOD(),
            txid: buffutils.toHex(this.txid),
            vout: this.vout,
            bitcoinAddress: this.bitcoinAddress,
            initCreated: this.initCreated,
        };
    }
}
exports.default = Hookin;
//# sourceMappingURL=hookin.js.map