export default async function hmacSHA256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k2 = await window.crypto.subtle.importKey(
    'raw',
    key,
    {
      name: 'HMAC',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign', 'verify']
  );

  const digest = await window.crypto.subtle.sign('HMAC', k2, data);

  return new Uint8Array(digest);
}
