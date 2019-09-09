"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
const hookout_1 = require("./hookout");
const fee_bump_1 = require("./fee-bump");
const lightning_payment_1 = require("./lightning-payment");
const lightning_invoice_1 = require("./lightning-invoice");
const hookin_1 = require("./hookin");
const claimable_1 = require("./claimable");
const status_1 = require("./status");
const abstract_status_1 = require("./status/abstract-status");
// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
class Acknowledged {
    // Warning: The constructor does not validate the signature
    constructor(contents, acknowledgement, toPOD) {
        this.acknowledgement = acknowledgement;
        this.contents = contents;
        this.toPOD = () => ({
            acknowledgement: this.acknowledgement.toPOD(),
            ...toPOD(this.contents),
        });
    }
    static acknowledge(contents, acknowledgeKey, toPOD) {
        const hash = contents.hash();
        const acknowledgement = signature_1.default.compute(hash.buffer, acknowledgeKey);
        return new Acknowledged(contents, acknowledgement, toPOD);
    }
    // Need to check .verify()
    static fromPOD(creator, toPOD, data) {
        const contents = creator(data);
        if (contents instanceof Error) {
            throw contents;
        }
        const acknowledgement = signature_1.default.fromPOD(data.acknowledgement);
        if (acknowledgement instanceof Error) {
            return acknowledgement;
        }
        return new Acknowledged(contents, acknowledgement, toPOD);
    }
    verify(acknowledgementPublicKey) {
        const hash = this.contents.hash();
        return this.acknowledgement.verify(hash.buffer, acknowledgementPublicKey);
    }
    hash() {
        return this.contents.hash();
    }
}
exports.default = Acknowledged;
function hookinFromPod(x) {
    return Acknowledged.fromPOD(hookin_1.default.fromPOD, (d) => d.toPOD(), x);
}
exports.hookinFromPod = hookinFromPod;
function feeBumpFromPod(x) {
    return Acknowledged.fromPOD(fee_bump_1.default.fromPOD, (d) => d.toPOD(), x);
}
exports.feeBumpFromPod = feeBumpFromPod;
function lightningPaymentFromPod(x) {
    return Acknowledged.fromPOD(lightning_payment_1.default.fromPOD, (d) => d.toPOD(), x);
}
exports.lightningPaymentFromPod = lightningPaymentFromPod;
function lightningInvoiceFromPod(x) {
    return Acknowledged.fromPOD(lightning_invoice_1.default.fromPOD, (d) => d.toPOD(), x);
}
exports.lightningInvoiceFromPod = lightningInvoiceFromPod;
function hookoutFromPod(x) {
    return Acknowledged.fromPOD(hookout_1.default.fromPOD, (d) => d.toPOD(), x);
}
exports.hookoutFromPod = hookoutFromPod;
function claimableFromPOD(x) {
    return Acknowledged.fromPOD(claimable_1.claimableFromPOD, claimable_1.claimableToPOD, x);
}
exports.claimableFromPOD = claimableFromPOD;
function statusFromPOD(x) {
    return Acknowledged.fromPOD(status_1.statusFromPOD, status_1.statusToPOD, x);
}
exports.statusFromPOD = statusFromPOD;
function acknowledge(x, acknowledgeKey) {
    if (x instanceof hookout_1.default ||
        x instanceof fee_bump_1.default ||
        x instanceof lightning_payment_1.default ||
        x instanceof lightning_invoice_1.default ||
        x instanceof hookin_1.default) {
        return Acknowledged.acknowledge(x, acknowledgeKey, claimable_1.claimableToPOD);
    }
    else if (x instanceof abstract_status_1.default) {
        return Acknowledged.acknowledge(x, acknowledgeKey, status_1.statusToPOD);
    }
    else {
        return Acknowledged.acknowledge(x, acknowledgeKey, (z) => z.toPOD());
    }
}
exports.acknowledge = acknowledge;
//# sourceMappingURL=acknowledged.js.map