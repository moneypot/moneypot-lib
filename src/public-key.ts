import Hash from './hash';

import * as ecc from './util/ecc/elliptic';
import * as bech32 from './util/bech32';

import RIPEMD160 from './util/bcrypto/ripemd160';
import SHA256 from './util/bcrypto/sha256';

import * as buffutils from './util/buffutils';
import { Buffutils } from '.';

const serializedPrefix = 'pubhi'; // public key hookedin

export default class PublicKey {




  public static fromPOD(data: any): PublicKey | Error {
    if (typeof data !== 'string') {
      return new Error('PublicKey.fromPOD expected a string');
    }

    const { prefix, words } = bech32.decode(data);

    if (prefix !== serializedPrefix) {
      return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
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

  public toPOD() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }

  public tweak(n: PublicKey) {
    const newQ = ecc.pointAdd(this, n);

    return new PublicKey(newQ.x, newQ.y);
  }

  public derive(n: Uint8Array | number | bigint): PublicKey {
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

    const tweakBy = Hash.fromMessage('derive', this.buffer, nBuff).buffer;
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

  public toAddress(custodianHash: Hash) {
    let prefix = 'hia' + bech32.ALPHABET[custodianHash.buffer[0] % 32] + bech32.ALPHABET[custodianHash.buffer[1] % 32];
    const words = bech32.toWords(this.buffer);
    return bech32.encode(prefix, words);
  }

  // If you don't provide the custodian hash, it don't check the prefix is correct!
  static fromAddress(address: string, custodianHash: Hash | undefined): PublicKey | Error {
  
    const { prefix, words } = bech32.decode(address);

    if (custodianHash !== undefined) {
      const expectedPrefix = 'hia' + bech32.ALPHABET[custodianHash.buffer[0] % 32] + bech32.ALPHABET[custodianHash.buffer[1] % 32];
      if (prefix !== expectedPrefix) {
        return new Error('prefix does not match expected of such custodian');
      }
    }

    return PublicKey.fromBytes(bech32.fromWords(words));
  }

  public toBitcoinAddress(testnet: boolean = true): string {
    const prefix = testnet ? 'tb' : 'bc';

    const pubkeyHash = rmd160sha256(this.buffer);

    const words = bech32.toWords(pubkeyHash);

    const version = new Uint8Array(1); // [0]
    return bech32.encode(prefix, buffutils.concat(version, words));
  }
}

function rmd160sha256(data: Uint8Array) {
  return RIPEMD160.digest(SHA256.digest(data));
}
