export default function random(size: number): Uint8Array {
  const buff = new Uint8Array(size);
  window.crypto.getRandomValues(buff);
  return buff;
}
