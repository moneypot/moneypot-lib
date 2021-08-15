"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sha256_1 = __importDefault(require("./bcrypto/sha256"));
const base58 = __importStar(require("./base58"));
const buffutils = __importStar(require("./buffutils"));
function checksumFn(buffer) {
    return sha256_1.default.digest(sha256_1.default.digest(buffer));
}
function encode(payload) {
    const checksum = checksumFn(payload).slice(0, 4);
    return base58.encode(buffutils.concat(payload, checksum));
}
exports.encode = encode;
function decodeRaw(buffer) {
    const payload = buffer.slice(0, -4);
    const checksum = buffer.slice(-4);
    const newChecksum = checksumFn(payload);
    if ((checksum[0] ^ newChecksum[0]) |
        (checksum[1] ^ newChecksum[1]) |
        (checksum[2] ^ newChecksum[2]) |
        (checksum[3] ^ newChecksum[3])) {
        return;
    }
    return payload;
}
// Decode a base58-check encoded string to a buffer, no result if checksum is wrong
function decodeUnsafe(str) {
    const buffer = base58.decodeUnsafe(str);
    if (!buffer) {
        return;
    }
    return decodeRaw(buffer);
}
exports.decodeUnsafe = decodeUnsafe;
function decode(str) {
    const buffer = base58.decode(str);
    const payload = decodeRaw(buffer);
    if (!payload) {
        throw new Error('Invalid checksum');
    }
    return payload;
}
exports.decode = decode;
//# sourceMappingURL=bs58check.js.map