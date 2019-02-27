import Signature from './signature';
import Params from './params';
// T is what is acknowledged, a P is the type of a  T.toPOD()
// type inference of this thing kind of sucks. So it's recommended to use
// x: AcknowledgedX = hi.Acknowledged(....)  to guide it
export default class Acknowledged {
    // Warning: The constructor does not validate the signature
    constructor(contents, acknowledgement) {
        this.acknowledgement = acknowledgement;
        this.contents = contents;
    }
    static async acknowledge(contents, acknowledgeKey) {
        const hash = await contents.hash();
        const acknowledgement = await Signature.compute(hash.buffer, acknowledgeKey);
        return new Acknowledged(contents, acknowledgement);
    }
    static async fromPOD(creator, data) {
        const contents = creator(data);
        if (contents instanceof Error) {
            throw contents;
        }
        const acknowledgement = Signature.fromBech(data.acknowledgement);
        if (acknowledgement instanceof Error) {
            throw acknowledgement;
        }
        const hash = await contents.hash();
        if (!acknowledgement.verify(hash.buffer, Params.acknowledgementPublicKey)) {
            throw new Error('acknowledgement does not verify');
        }
        return new Acknowledged(contents, acknowledgement);
    }
    toPOD() {
        return {
            acknowledgement: this.acknowledgement.toBech(),
            ...this.contents.toPOD(),
        };
    }
}
//# sourceMappingURL=acknowledged.js.map