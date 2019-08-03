"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const abstract_transfer_1 = require("./abstract-transfer");
class Hookout extends abstract_transfer_1.default {
    static fromPOD(data) {
        const transferData = abstract_transfer_1.parseTransferData(data);
        if (transferData instanceof Error) {
            return transferData;
        }
        const bitcoinAddress = data.bitcoinAddress;
        if (typeof bitcoinAddress !== 'string') {
            return new Error('Hookout.fromPOD invalid bitcoin address');
        }
        const priority = data.priority;
        if (['CUSTOM', 'IMMEDIATE', 'BATCH', 'FREE'].indexOf(priority) === -1) {
            return new Error('Unrecognized priority');
        }
        return new Hookout(transferData, bitcoinAddress, priority);
    }
    get kind() {
        return 'Hookout';
    }
    constructor(td, bitcoinAddress, priority) {
        super(td);
        this.bitcoinAddress = bitcoinAddress;
        this.priority = priority;
    }
    toPOD() {
        return {
            ...super.toPOD(),
            bitcoinAddress: this.bitcoinAddress,
            priority: this.priority,
        };
    }
    hash() {
        const h = hash_1.default.newBuilder('Hookout');
        h.update(super.transferHash().buffer);
        h.update(Buffutils.fromString(this.bitcoinAddress));
        h.update(Buffutils.fromUint8(this.priority.charCodeAt(0)));
        return h.digest();
    }
}
exports.default = Hookout;
//# sourceMappingURL=hookout.js.map