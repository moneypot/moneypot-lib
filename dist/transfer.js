"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
class Transfer {
    static hashOf(sourceHash, outputHash) {
        const h = hash_1.default.newBuilder('Transfer');
        h.update(sourceHash.buffer);
        h.update(outputHash.buffer);
        return h.digest();
    }
}
exports.default = Transfer;
//# sourceMappingURL=transfer.js.map