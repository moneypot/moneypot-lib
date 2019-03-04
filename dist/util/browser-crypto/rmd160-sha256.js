"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ripemd160_1 = require("./ripemd160");
const sha256_1 = require("./sha256");
async function default_1(data) {
    const rmd = new ripemd160_1.default();
    rmd.update(await sha256_1.default(data));
    return rmd.digest();
}
exports.default = default_1;
//# sourceMappingURL=rmd160-sha256.js.map