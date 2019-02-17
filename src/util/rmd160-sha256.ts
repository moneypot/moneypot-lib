import { createHash } from 'crypto';

export default function(data: Uint8Array): Uint8Array {
  return createHash('rmd160')
    .update(
      createHash('sha256')
        .update(data)
        .digest()
    )
    .digest();
}
