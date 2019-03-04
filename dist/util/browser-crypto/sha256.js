"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function sha256(data) {
    return new Uint8Array(await window.crypto.subtle.digest('SHA-256', data));
}
exports.default = sha256;
//# sourceMappingURL=sha256.js.map