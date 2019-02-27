import { createHmac } from 'crypto';
export default async function hmacSHA512(key, data) {
    return createHmac('sha512', key)
        .update(data)
        .digest();
}
//# sourceMappingURL=hmac-sha512.js.map