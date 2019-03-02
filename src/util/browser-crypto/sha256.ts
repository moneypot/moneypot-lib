export default async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await window.crypto.subtle.digest('SHA-256', data));
}
