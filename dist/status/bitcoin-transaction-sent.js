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
const buffutils = __importStar(require("../util/buffutils"));
class BitcoinTransactionSent extends abstract_status_1.default {
    constructor(claimableHash, txid) {
        super(claimableHash);
        this.txid = txid;
    }
    hash() {
        return hash_1.default.fromMessage('BitcoinTransactionSent', this.buffer, this.txid);
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimableHash: this.claimableHash.toPOD(),
            txid: buffutils.toHex(this.txid),
        };
    }
    static fromPOD(obj) {
        if (typeof obj !== 'object') {
            return new Error('BitcoinTransactionSent.fromPOD expected an object');
        }
        const claimableHash = hash_1.default.fromPOD(obj.claimableHash);
        if (claimableHash instanceof Error) {
            return claimableHash;
        }
        const txid = buffutils.fromHex(obj.txid, 32);
        if (txid instanceof Error) {
            return txid;
        }
        return new BitcoinTransactionSent(claimableHash, txid);
    }
}
exports.default = BitcoinTransactionSent;
//# sourceMappingURL=bitcoin-transaction-sent.js.map