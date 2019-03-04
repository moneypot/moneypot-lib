export default function (x) {
    if (!x) {
        throw new Error('assertion failed');
    }
}
export function equal(l, r) {
    if (l !== r) {
        console.error('assertion failed: ', l, ' !=== ', r);
        throw new Error('assertion failed');
    }
}
export function is(l, r) {
    if (!(l instanceof r)) {
        console.error('assertion failed: ', l, ' is not instance of ', r);
        throw new Error('assertion failed');
    }
}
export function check(f, x) {
    if (f(x) !== true) {
        console.error('assertion failed: ', x, ' didnt pass the test');
        throw new Error('assertion failed');
    }
}
//# sourceMappingURL=assert.js.map