"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../assert");
class HMAC {
    constructor(Hash, size, x = [], y = []) {
        this.hash = Hash;
        this.size = size;
        this.inner = Hash();
        this.outer = Hash();
    }
    init(key) {
        // Shorten key
        if (key.length > this.size) {
            const h = this.hash();
            h.init();
            h.update(key);
            key = h.final();
            assert_1.default(key.length <= this.size);
        }
        // Pad key
        const pad = Buffer.allocUnsafe(this.size);
        for (let i = 0; i < key.length; i++)
            pad[i] = key[i] ^ 0x36;
        for (let i = key.length; i < pad.length; i++)
            pad[i] = 0x36;
        this.inner.init();
        this.inner.update(pad);
        for (let i = 0; i < key.length; i++)
            pad[i] = key[i] ^ 0x5c;
        for (let i = key.length; i < pad.length; i++)
            pad[i] = 0x5c;
        this.outer.init();
        this.outer.update(pad);
        return this;
    }
    update(data) {
        this.inner.update(data);
        return this;
    }
    final() {
        this.outer.update(this.inner.final());
        return this.outer.final();
    }
}
exports.default = HMAC;
//# sourceMappingURL=hmac.js.map