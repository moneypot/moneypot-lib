import { createHmac } from 'crypto';

export default async function hmacSHA256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  return createHmac('sha256', key)
    .update(data)
    .digest();
}
