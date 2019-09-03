"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffutils = require("./util/buffutils");
const hash_1 = require("./hash");
const abstract_transfer_1 = require("./abstract-transfer");
class Hookout extends abstract_transfer_1.default {
    constructor(td, bitcoinAddress, priority) {
        super(td);
        this.bitcoinAddress = bitcoinAddress;
        this.priority = priority;
    }
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
    toPOD() {
        return {
            ...super.toPOD(),
            bitcoinAddress: this.bitcoinAddress,
            priority: this.priority,
        };
    }
    static hashOf(transferDataHash, bitcoinAddress, priority) {
        return hash_1.default.fromMessage('Hookout', transferDataHash.buffer, Buffutils.fromString(bitcoinAddress), Buffutils.fromString(priority[0]) // first letter must be unique
        );
    }
    hash() {
        return Hookout.hashOf(abstract_transfer_1.default.transferHash(this), this.bitcoinAddress, this.priority);
    }
}
exports.default = Hookout;
//# sourceMappingURL=hookout.js.map