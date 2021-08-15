"use strict";
// CORE DATA
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var elliptic_1 = require("./elliptic");
exports.Scalar = elliptic_1.Scalar;
exports.Point = elliptic_1.Point;
exports.INFINITE_POINT = elliptic_1.INFINITE_POINT;
// CURVE MATH
var elliptic_2 = require("./elliptic");
exports.scalarAdd = elliptic_2.scalarAdd;
exports.scalarMultiply = elliptic_2.scalarMultiply;
exports.pointMultiply = elliptic_2.pointMultiply;
exports.pointAdd = elliptic_2.pointAdd;
var signature_1 = require("./signature");
exports.Signature = signature_1.Signature;
exports.sign = signature_1.sign;
exports.verify = signature_1.verify;
exports.verifyECDSA = signature_1.verifyECDSA;
var blind_1 = require("./blind");
exports.blindMessage = blind_1.blindMessage;
exports.blindSign = blind_1.blindSign;
exports.unblind = blind_1.unblind;
exports.blindVerify = blind_1.blindVerify;
// MULTI SIGNATURES
const muSig = __importStar(require("./mu-sig"));
exports.muSig = muSig;
// CONVENIENCE
const util = __importStar(require("./util"));
exports.util = util;
//# sourceMappingURL=index.js.map