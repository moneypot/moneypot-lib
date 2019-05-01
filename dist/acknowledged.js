"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("./signature");
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
//# sourceMappingURL=acknowledged.js.map