"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
function random(size) {
    const buff = new Uint8Array(size);
    crypto_1.randomFillSync(buff);
    return buff;
}
exports.default = random;
//# sourceMappingURL=random.js.map