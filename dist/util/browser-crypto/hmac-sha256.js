export default async function hmacSHA256(key, data) {
    const k2 = await window.crypto.subtle.importKey('raw', key, {
        name: 'HMAC',
        hash: { name: 'SHA-256' },
    }, false, ['sign', 'verify']);
    const digest = await window.crypto.subtle.sign('HMAC', k2, data);
    return new Uint8Array(digest);
}
//# sourceMappingURL=hmac-sha256.js.map