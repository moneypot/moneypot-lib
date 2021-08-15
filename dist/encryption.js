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
const hash_1 = __importDefault(require("./hash"));
const ecc = __importStar(require("./util/ecc"));
const aes = __importStar(require("./util/aes-gcm"));
function encryptToPublicKey(message, ourPriv, theirPub) {
    const sharedPoint = ecc.pointMultiply(theirPub, ourPriv.scalar);
    const sharedSecret = hash_1.default.fromMessage('sharedSecret', ecc.Point.toBytes(sharedPoint)).buffer;
    return aes.encrypt(message, sharedSecret);
}
exports.encryptToPublicKey = encryptToPublicKey;
function decrypt(payload, ourPriv, theirPub) {
    const sharedPoint = ecc.pointMultiply(theirPub, ourPriv.scalar);
    const sharedSecret = hash_1.default.fromMessage('sharedSecret', ecc.Point.toBytes(sharedPoint)).buffer;
    return aes.decrypt(payload, sharedSecret);
}
exports.decrypt = decrypt;
//# sourceMappingURL=encryption.js.map