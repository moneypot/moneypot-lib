import { createHash } from 'crypto';
export default async function sha256(data) {
    return createHash('sha256')
        .update(data)
        .digest();
}
//# sourceMappingURL=sha256.js.map