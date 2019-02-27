export function isAmount(x) {
    return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
}
export const MaxMagnitude = 30;
export function isMagnitude(x) {
    return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0 && x <= MaxMagnitude;
}
//# sourceMappingURL=pod.js.map