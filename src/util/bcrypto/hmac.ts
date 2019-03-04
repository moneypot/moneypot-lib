import assert from "../assert";

interface HashType {
  init(): void;
  update(key: Uint8Array): void;
  final(): Uint8Array;
}
type HashCtor = () => HashType;

export default class HMAC {

  hash: HashCtor;
  size: number;
  inner: HashType;
  outer: HashType;

  constructor(Hash: HashCtor, size: number, x = [], y = []) {
    this.hash = Hash;
    this.size = size;

    this.inner = Hash();
    this.outer = Hash();
  }

  init(key: Uint8Array) {

    // Shorten key
    if (key.length > this.size) {
      const h = this.hash();

      h.init();
      h.update(key);

      key = h.final();

      assert(key.length <= this.size);
    }

    // Pad key
    const pad = Buffer.allocUnsafe(this.size);

    for (let i = 0; i < key.length; i++)
      pad[i] = key[i] ^ 0x36;

    for (let i = key.length; i < pad.length; i++)
      pad[i] = 0x36;

    this.inner.init();
    this.inner.update(pad);

    for (let i = 0; i < key.length; i++)
      pad[i] = key[i] ^ 0x5c;

    for (let i = key.length; i < pad.length; i++)
      pad[i] = 0x5c;

    this.outer.init();
    this.outer.update(pad);

    return this;
  }


  update(data: Uint8Array) {
    this.inner.update(data);
    return this;
  }


  final() {
    this.outer.update(this.inner.final());
    return this.outer.final();
  }
}
