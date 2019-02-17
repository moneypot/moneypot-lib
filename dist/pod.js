"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAmount(x) {
    return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
}
exports.isAmount = isAmount;
exports.MaxMagnitude = 30;
function isMagnitude(x) {
    return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0 && x <= exports.MaxMagnitude;
}
exports.isMagnitude = isMagnitude;
//# sourceMappingURL=pod.js.map