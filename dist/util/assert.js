"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(x) {
    if (!x) {
        throw new Error('assertion failed');
    }
}
exports.default = default_1;
function equal(l, r) {
    if (l !== r) {
        console.error('assertion failed: ', l, ' !=== ', r);
        throw new Error('assertion failed');
    }
}
exports.equal = equal;
function is(l, r) {
    if (!(l instanceof r)) {
        console.error('assertion failed: ', l, ' is not instance of ', r);
        throw new Error('assertion failed');
    }
}
exports.is = is;
function check(f, x) {
    if (f(x) !== true) {
        console.error('assertion failed: ', x, ' didnt pass the test');
        throw new Error('assertion failed');
    }
}
exports.check = check;
//# sourceMappingURL=assert.js.map