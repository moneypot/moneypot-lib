import { createHmac } from 'crypto';

export default async function hmacSHA512(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  return createHmac('sha512', key)
    .update(data)
    .digest();
}
