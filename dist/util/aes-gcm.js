"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const random_1 = __importDefault(require("./random"));
const Buffutils = __importStar(require("./buffutils"));
function encrypt(plainText, key) {
    const iv = random_1.default(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const start = cipher.update(plainText);
    const end = cipher.final();
    const encrypted = Buffutils.concat(start, end);
    const tag = cipher.getAuthTag();
    return {
        iv,
        tag,
        encrypted,
    };
}
exports.encrypt = encrypt;
function decrypt(payload, key) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.iv);
    decipher.setAuthTag(payload.tag);
    // encrypt the given text
    const start = decipher.update(payload.encrypted);
    const end = decipher.final();
    return Buffutils.concat(start, end);
}
exports.decrypt = decrypt;
//# sourceMappingURL=aes-gcm.js.map