"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAmount(x) {
    return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
}
exports.isAmount = isAmount;
exports.MaxMagnitude = 30;
//# sourceMappingURL=pod.js.map