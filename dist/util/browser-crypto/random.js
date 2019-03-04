"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function random(size) {
    const buff = new Uint8Array(size);
    window.crypto.getRandomValues(buff);
    return buff;
}
exports.default = random;
//# sourceMappingURL=random.js.map