"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
const params_1 = require("./params");
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
    static fromPOD(creator, data) {
        const contents = creator(data);
        if (contents instanceof Error) {
            throw contents;
        }
        const acknowledgement = signature_1.default.fromBech(data.acknowledgement);
        if (acknowledgement instanceof Error) {
            throw acknowledgement;
        }
        const hash = contents.hash();
        if (!acknowledgement.verify(hash.buffer, params_1.default.acknowledgementPublicKey)) {
            throw new Error('acknowledgement does not verify');
        }
        return new Acknowledged(contents, acknowledgement);
    }
    hash() {
        return this.contents.hash();
    }
    toPOD() {
        return {
            acknowledgement: this.acknowledgement.toBech(),
            ...this.contents.toPOD(),
        };
    }
}
exports.default = Acknowledged;
//# sourceMappingURL=acknowledged.js.map