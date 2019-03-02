import { createHash } from 'crypto';

export default async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return createHash('sha256')
    .update(data)
    .digest();
}
