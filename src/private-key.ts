import * as ecc from './util/ecc';
import Hash from './hash';

import PublicKey from './public-key';
import * as bech32 from './util/bech32';
import * as wif from './util/wif';
import random from './util/node-crypto/random';

const serializedPrefix = 'privhi'; // private key hookedin

export default class PrivateKey {
  public static fromBech(str: string) {
    const { prefix, words } = bech32.decode(str);

    if (prefix !== serializedPrefix) {
      throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return PrivateKey.fromBytes(bech32.fromWords(words));
  }

  public static fromBytes(bytes: Uint8Array): PrivateKey | Error {
    const s = ecc.Scalar.fromBytes(bytes);
    if (s instanceof Error) {
      return s;
    }
    return new PrivateKey(s);
  }

  public static fromRand() {
    const buff = random(32);
    const s = ecc.Scalar.fromBytes(buff);
    if (s instanceof Error) {
      throw s; // should never really happen..
    }
    return new PrivateKey(s);
  }

  public scalar: ecc.Scalar;

  private constructor(scalar: ecc.Scalar) {
    this.scalar = scalar;
  }

  public get buffer(): Uint8Array {
    return ecc.Scalar.toBytes(this.scalar);
  }

  public toBech() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }

  public toPublicKey(): PublicKey {
    const point = ecc.Point.fromPrivKey(this.scalar);
    return new PublicKey(point.x, point.y);
  }

  public tweak(n: PrivateKey) {
    const newD = ecc.scalarAdd(this.scalar, n.scalar);

    return new PrivateKey(newD);
  }

  // Just for bitcoin compatibilty, shouldn't really be used...
  public toWif(testnet: boolean = true) {
    const prefix = testnet ? 0xef : 0x80;

    return wif.encode(prefix, this.buffer, true);
  }

  public async derive(n: Uint8Array): Promise<PrivateKey> {
    const tweakBy = (await Hash.fromMessage('derive', this.toPublicKey().buffer, n)).buffer;
    const tweakByN = ecc.Scalar.fromBytes(tweakBy);
    if (tweakByN instanceof Error) {
      throw tweakByN;
    }

    const newD = ecc.scalarAdd(this.scalar, tweakByN);

    return new PrivateKey(newD);
  }
}
