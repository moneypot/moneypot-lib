import * as bs58check from './bs58check';

export function decodeRaw(buffer: Uint8Array, version: number) {
  // check version only if defined
  if (version !== undefined && buffer[0] !== version) {
    throw new Error('Invalid network version');
  }

  // uncompressed
  if (buffer.length === 33) {
    return {
      version: buffer[0],
      privateKey: buffer.slice(1, 33),
      compressed: false,
    };
  }

  // invalid length
  if (buffer.length !== 34) {
    throw new Error('Invalid WIF length');
  }

  // invalid compression flag
  if (buffer[33] !== 0x01) {
    throw new Error('Invalid compression flag');
  }

  return {
    version: buffer[0],
    privateKey: buffer.slice(1, 33),
    compressed: true,
  };
}

export function encodeRaw(version: number, privateKey: Uint8Array, compressed: boolean = true) {
  const result = new Uint8Array(compressed ? 34 : 33);

  result[0] = version;
  result.set(privateKey, 1);

  if (compressed) {
    result[33] = 0x01;
  }

  return result;
}

export async function decode(str: string, version: number) {
  return decodeRaw(await bs58check.decode(str), version);
}

export function encode(version: number, privateKey: Uint8Array, compressed: boolean = true) {
  return bs58check.encode(encodeRaw(version, privateKey, compressed));
}
