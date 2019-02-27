import { createHmac } from 'crypto';
export default async function hmacSHA256(key, data) {
    return createHmac('sha256', key)
        .update(data)
        .digest();
}
//# sourceMappingURL=hmac-sha256.js.map