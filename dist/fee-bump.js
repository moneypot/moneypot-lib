"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = __importStar(require("./util/buffutils"));
const hash_1 = __importDefault(require("./hash"));
const assert = __importStar(require("./util/assert"));
const abstract_transfer_1 = __importStar(require("./abstract-transfer"));
class FeeBump extends abstract_transfer_1.default {
    constructor(transferData, txid, confTarget) {
        super(transferData);
        this.txid = txid;
        assert.equal(txid.length, 32);
        this.txid = txid;
        this.confTarget = confTarget;
    }
    static fromPOD(data) {
        const transferData = abstract_transfer_1.parseTransferData(data);
        if (transferData instanceof Error) {
            throw transferData;
        }
        const txid = Buffutils.fromHex(data.txid, 32);
        if (txid instanceof Error) {
            return new Error('FeeBump.fromPOD invalid txid');
        }
        const confTarget = data.confTarget;
        if (typeof confTarget !== 'number') {
            return new Error('Feebump.frompod invalid conftarget');
        }
        return new FeeBump(transferData, txid, confTarget);
    }
    get kind() {
        return 'FeeBump';
    }
    toPOD() {
        return {
            ...super.toPOD(),
            txid: Buffutils.toHex(this.txid),
            confTarget: this.confTarget
        };
    }
    static hashOf(transferHash, txid, confTarget) {
        return hash_1.default.fromMessage('FeeBump', transferHash.buffer, txid, Buffutils.fromUint64(confTarget));
    }
    hash() {
        return FeeBump.hashOf(abstract_transfer_1.default.transferHash(this), this.txid, this.confTarget);
    }
}
exports.default = FeeBump;
//# sourceMappingURL=fee-bump.js.map