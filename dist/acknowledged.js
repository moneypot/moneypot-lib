"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
const claim_response_1 = require("./claim-response");
const hookout_1 = require("./hookout");
const fee_bump_1 = require("./fee-bump");
const lightning_payment_1 = require("./lightning-payment");
const lightning_invoice_1 = require("./lightning-invoice");
const hookin_1 = require("./hookin");
// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
class Acknowledged {
    // Warning: The constructor does not validate the signature
    constructor(contents, acknowledgement) {
        this.acknowledgement = acknowledgement;
        this.contents = contents;
    }
    static acknowledge(contents, acknowledgeKey) {
        const hash = contents.hash();
        const acknowledgement = signature_1.default.compute(hash.buffer, acknowledgeKey);
        return new Acknowledged(contents, acknowledgement);
    }
    // Need to check .verify()
    static fromPOD(creator, data) {
        const contents = creator(data);
        if (contents instanceof Error) {
            throw contents;
        }
        const acknowledgement = signature_1.default.fromPOD(data.acknowledgement);
        if (acknowledgement instanceof Error) {
            return acknowledgement;
        }
        return new Acknowledged(contents, acknowledgement);
    }
    verify(acknowledgementPublicKey) {
        const hash = this.contents.hash();
        return this.acknowledgement.verify(hash.buffer, acknowledgementPublicKey);
    }
    hash() {
        return this.contents.hash();
    }
    toPOD() {
        return {
            acknowledgement: this.acknowledgement.toPOD(),
            ...this.contents.toPOD(),
        };
    }
}
exports.default = Acknowledged;
function claimResponse(x) {
    return Acknowledged.fromPOD(claim_response_1.default.fromPOD, x);
}
exports.claimResponse = claimResponse;
function hookinFromPod(x) {
    return Acknowledged.fromPOD(hookin_1.default.fromPOD, x);
}
exports.hookinFromPod = hookinFromPod;
function feeBumpFromPod(x) {
    return Acknowledged.fromPOD(fee_bump_1.default.fromPOD, x);
}
exports.feeBumpFromPod = feeBumpFromPod;
function lightningPaymentFromPod(x) {
    return Acknowledged.fromPOD(lightning_payment_1.default.fromPOD, x);
}
exports.lightningPaymentFromPod = lightningPaymentFromPod;
function lightningInvoiceFromPod(x) {
    return Acknowledged.fromPOD(lightning_invoice_1.default.fromPOD, x);
}
exports.lightningInvoiceFromPod = lightningInvoiceFromPod;
function hookoutFromPod(x) {
    return Acknowledged.fromPOD(hookout_1.default.fromPOD, x);
}
exports.hookoutFromPod = hookoutFromPod;
function acknowledge(x, acknowledgeKey) {
    return Acknowledged.acknowledge(x, acknowledgeKey);
}
exports.acknowledge = acknowledge;
//# sourceMappingURL=acknowledged.js.map