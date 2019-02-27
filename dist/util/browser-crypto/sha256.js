export default async function sha256(data) {
    return new Uint8Array(await window.crypto.subtle.digest('SHA-256', data));
}
//# sourceMappingURL=sha256.js.map