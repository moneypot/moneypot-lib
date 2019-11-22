import * as ecc from './util/ecc';
import Hash from './hash';

import PublicKey from './public-key';
import * as bech32 from './util/bech32';
import * as wif from './util/wif';
import random from './util/random';
import * as Buffutils from './util/buffutils';
import { privkeyCombine } from './util/ecc/mu-sig';

const serializedPrefix = 'privmp'; // private key moneypot

export default class PrivateKey {
  public static fromPOD(data: any): PrivateKey | Error {
    if (typeof data !== 'string') {
      return new Error('PrivateKey.fromPOD expected a string');
    }

    const { prefix, words } = bech32.decode(data);

    if (prefix !== serializedPrefix) {
      return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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

  static combine(privkeys: PrivateKey[]) {
    return new PrivateKey(privkeyCombine(privkeys.map(p => p.scalar)));
  }

  public scalar: ecc.Scalar;

  constructor(scalar: ecc.Scalar) {
    this.scalar = scalar;
  }

  public get buffer(): Uint8Array {
    return ecc.Scalar.toBytes(this.scalar);
  }

  public toPOD() {
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

  public derive(n: Uint8Array | number | bigint): PrivateKey {
    let nBuff;
    if (n instanceof Uint8Array) {
      nBuff = n;
    } else if (typeof n === 'bigint') {
      nBuff = Buffutils.fromBigInt(n);
    } else if (typeof n === 'number') {
      nBuff = Buffutils.fromVarInt(n);
    } else {
      throw new Error('unexpected type for deriving with. must be a Uint8Array | number | bigint');
    }

    const tweakBy = Hash.fromMessage('derive', this.toPublicKey().buffer, nBuff).buffer;
    const tweakByN = ecc.Scalar.fromBytes(tweakBy);
    if (tweakByN instanceof Error) {
      throw tweakByN;
    }

    const newD = ecc.scalarAdd(this.scalar, tweakByN);

    return new PrivateKey(newD);
  }
}
