import Hash from './hash';
import * as assert from './util/assert';

import * as ecc from './util/ecc/elliptic';
import * as bech32 from './util/bech32';

import rmd160sha256 from './util/node-crypto/rmd160-sha256';

import * as buffutils from './util/buffutils';

const serializedPrefix = 'pubhi'; // public key hookedin

export default class PublicKey {
  public static fromBech(serialized: string) {
    const { prefix, words } = bech32.decode(serialized);

    if (prefix !== serializedPrefix) {
      throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return PublicKey.fromBytes(bech32.fromWords(words));
  }

  public static fromBytes(serialized: Uint8Array): PublicKey | Error {
    const point = ecc.Point.fromBytes(serialized);
    if (point instanceof Error) {
      return point;
    }
    return new PublicKey(point.x, point.y);
  }

  x: ecc.Scalar;
  y: ecc.Scalar;

  public get buffer(): Uint8Array {
    return ecc.Point.toBytes(this);
  }

  // dont directly use...
  constructor(x: ecc.Scalar, y: ecc.Scalar) {
    this.x = x;
    this.y = y;
  }

  public toBech() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }

  public tweak(n: PublicKey) {
    const newQ = ecc.pointAdd(this, n);

    return new PublicKey(newQ.x, newQ.y);
  }

  public derive(n: Uint8Array): PublicKey {
    const tweakBy = (Hash.fromMessage('derive', this.buffer, n)).buffer;
    const tweakByN = ecc.Scalar.fromBytes(tweakBy);
    if (tweakByN instanceof Error) {
      throw tweakByN;
    }
    const tweakPoint = ecc.Point.fromPrivKey(tweakByN);

    const newQ = ecc.pointAdd(this, tweakPoint);

    return new PublicKey(newQ.x, newQ.y);
  }

  public hash() {
    return Hash.fromMessage('PublicKey', this.buffer);
  }

  public async toBitcoinAddress(testnet: boolean = true): Promise<string> {
    const prefix = testnet ? 'tb' : 'bc';

    const pubkeyHash = await rmd160sha256(this.buffer);

    const words = bech32.toWords(pubkeyHash);

    const version = new Uint8Array(1); // [0]
    return bech32.encode(prefix, buffutils.concat(version, words));
  }
}
