import { createHash } from 'crypto';

// We are making this async purely to match the signature of browser-node-crypto
// not because it's actually async ;'(
export default async function(data: Uint8Array): Promise<Uint8Array> {
  return createHash('rmd160')
    .update(
      createHash('sha256')
        .update(data)
        .digest(),
    )
    .digest();
}
