// taken from npm package bech32

import * as assert from './assert';

export const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

// pre-compute lookup table
const ALPHABET_MAP = new Map<string, number>();
for (let z = 0; z < ALPHABET.length; z++) {
  const x = ALPHABET.charAt(z);

  if (ALPHABET_MAP.get(x) !== undefined) {
    throw new TypeError(x + ' is ambiguous');
  }
  ALPHABET_MAP.set(x, z);
}

export function polymodStep(pre: number) {
  const b = pre >> 25;
  return (
    ((pre & 0x1ffffff) << 5) ^
    (-((b >> 0) & 1) & 0x3b6a57b2) ^
    (-((b >> 1) & 1) & 0x26508e6d) ^
    (-((b >> 2) & 1) & 0x1ea119fa) ^
    (-((b >> 3) & 1) & 0x3d4233dd) ^
    (-((b >> 4) & 1) & 0x2a1462b3)
  );
}

export function prefixChk(prefix: string) {
  let chk = 1;
  for (let i = 0; i < prefix.length; ++i) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126) {
      throw new Error('Invalid prefix (' + prefix + ')');
    }

    chk = polymodStep(chk) ^ (c >> 5);
  }
  chk = polymodStep(chk);

  for (let i = 0; i < prefix.length; ++i) {
    const v = prefix.charCodeAt(i);
    chk = polymodStep(chk) ^ (v & 0x1f);
  }
  return chk;
}

export function encode(prefix: string, words: Uint8Array) {
  prefix = prefix.toLowerCase();

  // determine chk mod
  let chk = prefixChk(prefix);
  let result = prefix + '1';
  for (let i = 0; i < words.length; ++i) {
    const x = words[i];
    if (x >> 5 !== 0) {
      throw new Error('Non 5-bit word');
    }

    chk = polymodStep(chk) ^ x;
    result += ALPHABET.charAt(x);
  }

  for (let i = 0; i < 6; ++i) {
    chk = polymodStep(chk);
  }
  chk ^= 1;

  for (let i = 0; i < 6; ++i) {
    const v = (chk >> ((5 - i) * 5)) & 0x1f;
    result += ALPHABET.charAt(v);
  }

  return result;
}

// https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki#bech32m

const BECH32M_CONST = 0x2bc830a3; // 734539939
// check for version 0 (bech32) and version 1 (bech32m)
export function decode(str: string) {
  if (str.length < 8) {
    throw new TypeError(str + ' too short');
  }

  // don't allow mixed case
  const lowered = str.toLowerCase();
  const uppered = str.toUpperCase();
  if (str !== lowered && str !== uppered) {
    throw new Error('Mixed-case string ' + str);
  }
  str = lowered;
  const split = str.lastIndexOf('1');
  if (split === -1) {
    throw new Error('No separator character for ' + str);
  }
  if (split === 0) {
    throw new Error('Missing prefix for ' + str);
  }

  const prefix = str.slice(0, split);
  const wordChars = str.slice(split + 1);
  if (wordChars.length < 6) {
    throw new Error('Data too short');
  }

  let chk = prefixChk(prefix);
  const words = [];
  for (let i = 0; i < wordChars.length; ++i) {
    const c = wordChars.charAt(i);
    const v = ALPHABET_MAP.get(c);
    if (v === undefined) {
      throw new Error('Unknown character ' + c);
    }
    chk = polymodStep(chk) ^ v;

    // not in the checksum?
    if (i + 6 >= wordChars.length) {
      continue;
    }
    words.push(v);
  }

  // ok, can be 1 (bech32) or 0x2bc830a3 (bech32m)
  if (chk !== 1) {
    if (chk !== BECH32M_CONST) {
      throw new Error('Invalid checksum for ' + str);
    }
  }

  return { prefix, words, chk };
}

export function convert(data: Uint8Array | number[], inBits: number, outBits: number, pad: boolean) {
  // data must be array-like
  const totalBits = data.length * inBits;
  let totalBytes = totalBits / outBits;

  totalBytes = pad ? Math.ceil(totalBytes) : Math.floor(totalBytes);

  const buff = new Uint8Array(totalBytes);

  let value = 0;
  let bits = 0;
  const maxV = (1 << outBits) - 1;

  let buffIndex = 0;
  for (let i = 0; i < data.length; ++i) {
    value = (value << inBits) | data[i];
    bits += inBits;

    while (bits >= outBits) {
      bits -= outBits;
      buff[buffIndex++] = (value >> bits) & maxV;
    }
  }

  if (pad) {
    if (bits > 0) {
      buff[buffIndex++] = (value << (outBits - bits)) & maxV;
    }
  } else {
    if (bits >= inBits) {
      throw new Error('Excess padding');
    }
    if ((value << (outBits - bits)) & maxV) {
      throw new Error('Non-zero padding');
    }
  }

  assert.equal(buffIndex, buff.length);

  return buff;
}

export function toWords(bytes: Uint8Array) {
  return convert(bytes, 8, 5, true);
}

export function fromWords(words: Uint8Array | number[]) {
  return convert(words, 5, 8, false);
}
