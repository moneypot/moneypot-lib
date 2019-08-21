"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractStatus {
    constructor(claimableHash) {
        this.claimableHash = claimableHash;
    }
    get buffer() {
        return this.claimableHash;
    }
}
exports.default = AbstractStatus;
//# sourceMappingURL=abstract-status.js.map