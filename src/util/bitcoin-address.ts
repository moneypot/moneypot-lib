import * as buffutils from './buffutils';
import * as bech32 from './bech32';
import * as bs58check from './bs58check';

export function toBase58Check(hash: Uint8Array, version: number) {
  const payload = new Uint8Array(21);

  payload[0] = version;
  buffutils.copy(hash, payload, 1);

  return bs58check.encode(payload);
}

export function toBech32(data: Uint8Array, version: number, prefix: string): string {
  const words = buffutils.concat(buffutils.fromUint8(version), bech32.toWords(data));

  return bech32.encode(prefix, words);
}
