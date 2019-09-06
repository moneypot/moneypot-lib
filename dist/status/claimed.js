"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_status_1 = require("./abstract-status");
const blinded_signature_1 = require("../blinded-signature");
const claim_request_1 = require("../claim-request");
const hash_1 = require("../hash");
// The response embeds the request, to make it easier to store/verify
class Claimed extends abstract_status_1.default {
    constructor(claimRequest, blindedReceipts) {
        super(claimRequest.claimableHash);
        this.claimRequest = claimRequest;
        this.blindedReceipts = blindedReceipts;
    }
    hash() {
        const h = hash_1.default.newBuilder('ClaimResponse');
        h.update(this.claimRequest.hash().buffer);
        for (const blindedReceipt of this.blindedReceipts) {
            h.update(blindedReceipt.buffer);
        }
        return h.digest();
    }
    toPOD() {
        return {
            hash: this.hash().toPOD(),
            claimableHash: this.claimRequest.claimableHash.toPOD(),
            claimRequest: this.claimRequest.toPOD(),
            blindedReceipts: this.blindedReceipts.map(x => x.toPOD()),
        };
    }
    static fromPOD(data) {
        if (typeof data !== 'object') {
            throw new Error('ClaimResponse must be an object');
        }
        const claimRequest = claim_request_1.default.fromPOD(data);
        if (claimRequest instanceof Error) {
            return claimRequest;
        }
        if (data.claimableHash != claimRequest.claimableHash.toPOD()) {
            return new Error('claimRequest claimableHash doesnt claimed statuses');
        }
        if (!Array.isArray(data.blindedReceipts)) {
            return new Error('expected blindedReceipts in ClaimResponse to be an array');
        }
        const blindedReceipts = [];
        for (const bep of data.blindedReceipts) {
            const blindedReceipt = blinded_signature_1.default.fromPOD(bep);
            if (blindedReceipt instanceof Error) {
                return blindedReceipt;
            }
            blindedReceipts.push(blindedReceipt);
        }
        return new Claimed(claimRequest, blindedReceipts);
    }
}
exports.default = Claimed;
//# sourceMappingURL=claimed.js.map