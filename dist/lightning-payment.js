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
const bolt11 = __importStar(require("./bolt11"));
const abstract_transfer_1 = __importStar(require("./abstract-transfer"));
class LightningPayment extends abstract_transfer_1.default {
    constructor(transferData, paymentRequest) {
        super(transferData);
        this.paymentRequest = paymentRequest;
        let pro = bolt11.decodeBolt11(paymentRequest);
        if (pro instanceof Error) {
            throw 'invalid bolt11 invoice: ' + pro.message;
        }
        if (pro.satoshis && pro.satoshis !== transferData.amount) {
            throw 'amount does not match invoice amount';
        }
    }
    static fromPOD(data) {
        const transferData = abstract_transfer_1.parseTransferData(data);
        if (transferData instanceof Error) {
            return transferData;
        }
        try {
            return new LightningPayment(transferData, data.paymentRequest);
        }
        catch (err) {
            return new Error(err);
        }
    }
    get kind() {
        return 'LightningPayment';
    }
    toPOD() {
        return {
            ...super.toPOD(),
            paymentRequest: this.paymentRequest,
        };
    }
    static hashOf(transferDataHash, paymentRequest) {
        return hash_1.default.fromMessage('LightningPayment', transferDataHash.buffer, Buffutils.fromString(paymentRequest));
    }
    hash() {
        return LightningPayment.hashOf(abstract_transfer_1.default.transferHash(this), this.paymentRequest);
    }
}
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map