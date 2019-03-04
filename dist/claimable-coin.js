import PublicKey from './public-key';
import * as POD from './pod';
import Hash from './hash';
import * as buffutils from './util/buffutils';
export default class ClaimableCoin {
    static fromPOD(data) {
        const claimant = PublicKey.fromBech(data.claimant);
        if (claimant instanceof Error) {
            return claimant;
        }
        const magnitude = data.magnitude;
        if (!POD.isMagnitude(magnitude)) {
            return new Error('invalid magnitude');
        }
        return new ClaimableCoin(claimant, magnitude);
    }
    constructor(claimant, magnitude) {
        this.claimant = claimant;
        this.magnitude = magnitude;
    }
    hash() {
        const h = Hash.newBuilder('ClaimableCoin');
        h.update(this.claimant.buffer);
        h.update(buffutils.fromUint8(this.magnitude));
        return h.digest();
    }
    toPOD() {
        return {
            claimant: this.claimant.toBech(),
            magnitude: this.magnitude,
        };
    }
}
//# sourceMappingURL=claimable-coin.js.map