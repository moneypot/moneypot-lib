"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function randomBrowser(size) {
    const buff = new Uint8Array(size);
    window.crypto.getRandomValues(buff);
    return buff;
}
exports.default = randomBrowser;
//# sourceMappingURL=random-browser.js.map