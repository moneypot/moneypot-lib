import { randomFillSync } from 'crypto';

export default function random(size: number): Uint8Array {
  const buff = new Uint8Array(size);
  randomFillSync(buff);
  return buff;
}
