import sha256 from './node-crypto/sha256';
import * as base58 from './base58';
import * as buffutils from './buffutils';
async function checksumFn(buffer) {
    return await sha256(await sha256(buffer));
}
export async function encode(payload) {
    const checksum = (await checksumFn(payload)).slice(0, 4);
    return base58.encode(buffutils.concat(payload, checksum));
}
async function decodeRaw(buffer) {
    const payload = buffer.slice(0, -4);
    const checksum = buffer.slice(-4);
    const newChecksum = await checksumFn(payload);
    if ((checksum[0] ^ newChecksum[0]) |
        (checksum[1] ^ newChecksum[1]) |
        (checksum[2] ^ newChecksum[2]) |
        (checksum[3] ^ newChecksum[3])) {
        return;
    }
    return payload;
}
// Decode a base58-check encoded string to a buffer, no result if checksum is wrong
export async function decodeUnsafe(str) {
    const buffer = base58.decodeUnsafe(str);
    if (!buffer) {
        return;
    }
    return await decodeRaw(buffer);
}
export async function decode(str) {
    const buffer = base58.decode(str);
    const payload = await decodeRaw(buffer);
    if (!payload) {
        throw new Error('Invalid checksum');
    }
    return payload;
}
//# sourceMappingURL=bs58check.js.map