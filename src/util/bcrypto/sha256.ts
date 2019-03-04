import assert from '../assert';
import HMAC from './hmac';
import * as buffutils from '../buffutils';

/*
 * Constants
 */

const FINALIZED = -1;
const DESC = new Uint8Array(8);
const PADDING = new Uint8Array(64);

PADDING[0] = 0x80;

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

/**
 * SHA256
 */

export default class SHA256 {
  state: Uint32Array;
  msg: Uint32Array;
  block: Uint8Array;
  size: number;


  constructor() {
    this.state = new Uint32Array(8);
    this.msg = new Uint32Array(64);
    this.block = new Uint8Array(64);
    this.size = FINALIZED;

    this.init();
  }

  init() {
    this.state[0] = 0x6a09e667;
    this.state[1] = 0xbb67ae85;
    this.state[2] = 0x3c6ef372;
    this.state[3] = 0xa54ff53a;
    this.state[4] = 0x510e527f;
    this.state[5] = 0x9b05688c;
    this.state[6] = 0x1f83d9ab;
    this.state[7] = 0x5be0cd19;
    this.size = 0;
    return this;
  }

  update(data: Uint8Array) {
    this._update(data, data.length);
    return this;
  }

  final() {
    return this._final(new Uint8Array(32));
  }


  private _update(data: Uint8Array, len: number) {
    assert(this.size !== FINALIZED);

    let pos = this.size & 0x3f;
    let off = 0;

    this.size += len;

    if (pos > 0) {
      let want = 64 - pos;

      if (want > len)
        want = len;

      buffutils.copy(data, this.block, pos, off, off + want);

      pos += want;
      len -= want;
      off += want;

      if (pos < 64)
        return;

      this.transform(this.block, 0);
    }

    while (len >= 64) {
      this.transform(data, off);
      off += 64;
      len -= 64;
    }

    if (len > 0) {
      buffutils.copy(data, this.block, 0, off, off + len);
    }
  }


  private _final(out: Uint8Array): Uint8Array {
    assert(this.size !== FINALIZED);

    const pos = this.size % 64;
    const len = this.size * 8;

    writeU32(DESC, len * (1 / 0x100000000), 0);
    writeU32(DESC, len, 4);

    this._update(PADDING, 1 + ((119 - pos) % 64));
    this._update(DESC, 8);

    for (let i = 0; i < 8; i++) {
      writeU32(out, this.state[i], i * 4);
      this.state[i] = 0;
    }

    for (let i = 0; i < 64; i++)
      this.msg[i] = 0;

    for (let i = 0; i < 64; i++)
      this.block[i] = 0;

    this.size = FINALIZED;

    return out;
  }


  transform(chunk: Uint8Array, pos: number) {
    const W = this.msg;

    let a = this.state[0];
    let b = this.state[1];
    let c = this.state[2];
    let d = this.state[3];
    let e = this.state[4];
    let f = this.state[5];
    let g = this.state[6];
    let h = this.state[7];
    let i = 0;

    for (; i < 16; i++)
      W[i] = readU32(chunk, pos + i * 4);

    for (; i < 64; i++)
      W[i] = sigma1(W[i - 2]) + W[i - 7] + sigma0(W[i - 15]) + W[i - 16];

    for (i = 0; i < 64; i++) {
      let t1 = h + Sigma1(e);
      t1 += Ch(e, f, g);
      t1 += K[i] + W[i];

      let t2 = Sigma0(a);
      t2 += Maj(a, b, c);

      h = g;
      g = f;
      f = e;

      e = d + t1;

      d = c;
      c = b;
      b = a;

      a = t1 + t2;
    }

    this.state[0] += a;
    this.state[1] += b;
    this.state[2] += c;
    this.state[3] += d;
    this.state[4] += e;
    this.state[5] += f;
    this.state[6] += g;
    this.state[7] += h;
  }

  static hash() {
    return new SHA256();
  }

  static hmac() {
    return new HMAC(SHA256.hash, 64);
  }

  static digest(...data: Uint8Array[]): Uint8Array {
    const h = new SHA256();
    for (const d of data) {
      h.update(d);
    }
    return h.final();
  }

  static mac(key: Uint8Array, data: Uint8Array) {
    const m = SHA256.hmac();
    m.init(key);
    m.update(data);
    return m.final();
  }
}

function Sigma0(x: number) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10);
}

function Sigma1(x: number) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7);
}

function sigma0(x: number) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3);
}

function sigma1(x: number) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10);
}

function Ch(x: number, y: number, z: number) {
  return z ^ (x & (y ^ z));
}

function Maj(x: number, y: number, z: number) {
  return (x & y) | (z & (x | y));
}

function writeU32(buf: Uint8Array, value: number, offset: number) {
  buf[offset] = value >>> 24;
  buf[offset + 1] = (value >> 16) & 0xff;
  buf[offset + 2] = (value >> 8) & 0xff;
  buf[offset + 3] = value & 0xff;
}

function readU32(buf: Uint8Array, offset: number) {
  return ((buf[offset] & 0xff) * 0x1000000)
    + (((buf[offset + 1] & 0xff) << 16)
      | ((buf[offset + 2] & 0xff) << 8)
      | (buf[offset + 3] & 0xff));
}
