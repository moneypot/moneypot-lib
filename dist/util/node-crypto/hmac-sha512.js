"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
async function hmacSHA512(key, data) {
    return crypto_1.createHmac('sha512', key)
        .update(data)
        .digest();
}
exports.default = hmacSHA512;
//# sourceMappingURL=hmac-sha512.js.map