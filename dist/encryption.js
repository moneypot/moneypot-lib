"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const ecc = require("./util/ecc");
const aes = require("./util/aes-gcm");
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