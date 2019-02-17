"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
function default_1(data) {
    return crypto_1.createHash('rmd160')
        .update(crypto_1.createHash('sha256')
        .update(data)
        .digest())
        .digest();
}
exports.default = default_1;
//# sourceMappingURL=rmd160-sha256.js.map