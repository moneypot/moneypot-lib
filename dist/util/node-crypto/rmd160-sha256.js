import { createHash } from 'crypto';
// We are making this async purely to match the signature of browser-node-crypto
// not because it's actually async ;'(
export default async function (data) {
    return createHash('rmd160')
        .update(createHash('sha256')
        .update(data)
        .digest())
        .digest();
}
//# sourceMappingURL=rmd160-sha256.js.map