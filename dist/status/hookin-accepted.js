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
const abstract_status_1 = __importDefault(require("./abstract-status"));
const hash_1 = __importDefault(require("../hash"));
const POD = __importStar(require("../pod"));
const buffutils = __importStar(require("../util/buffutils"));
class HookinAccepted extends abstract_status_1.default {
    // adversaryFee: number;
    constructor(claimableHash, consolidationFee) {
        super(claimableHash);
        this.consolidationFee = consolidationFee;
        // this.adversaryFee = adversaryFee;
    }
    hash() {
        const h = hash_1.default.newBuilder('HookinAccepted');
        h.update(this.claimableHash.buffer);
        h.update(buffutils.fromUint64(this.consolidationFee));
        // h.update(buffutils.fromUint64(this.adversaryFee))
        return h.digest();
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimableHash: this.claimableHash.toPOD(),
            consolidationFee: this.consolidationFee,
        };
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            throw new Error('HookinAccepted.fromPOD must take an object');
        }
        const claimableHash = hash_1.default.fromPOD(data.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const consolidationFee = data.consolidationFee;
        if (!POD.isAmount(consolidationFee)) {
            throw new Error('HookinAccepted.fromPOD expected an amount consolidation fee');
        }
        return new HookinAccepted(claimableHash, consolidationFee);
    }
}
exports.default = HookinAccepted;
//# sourceMappingURL=hookin-accepted.js.map