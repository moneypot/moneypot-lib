"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffutils = require("./buffutils");
const bech32 = require("./bech32");
const bs58check = require("./bs58check");
function toBase58Check(hash, version) {
    const payload = new Uint8Array(21);
    payload[0] = version;
    buffutils.copy(hash, payload, 1);
    return bs58check.encode(payload);
}
exports.toBase58Check = toBase58Check;
function toBech32(data, version, prefix) {
    const words = buffutils.concat(buffutils.fromUint8(version), bech32.toWords(data));
    return bech32.encode(prefix, words);
}
exports.toBech32 = toBech32;
//# sourceMappingURL=bitcoin-address.js.map