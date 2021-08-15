import Hash from './hash';
import * as ecc from './util/ecc/elliptic';
import * as bech32 from './util/bech32';

import RIPEMD160 from './util/bcrypto/ripemd160';
import SHA256 from './util/bcrypto/sha256';

import * as buffutils from './util/buffutils';
import { pubkeyCombine } from './util/ecc/mu-sig';
import { encode } from './util/base58';

const serializedPrefix = 'pubmp'; // public key moneypot

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

  static combine(pubkeys: PublicKey[]) {
    const t = pubkeyCombine(pubkeys);
    return new PublicKey(t.x, t.y);
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
      nBuff = buffutils.fromBigInt(n);
    } else if (typeof n === 'number') {
      nBuff = buffutils.fromVarInt(n);
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

  public toBitcoinAddress(testnet: boolean = true): string {
    const prefix = testnet ? 'tb' : 'bc';

    const pubkeyHash = rmd160sha256(this.buffer);

    const words = bech32.toWords(pubkeyHash);

    const version = new Uint8Array(1); // [0]
    return bech32.encode(prefix, buffutils.concat(version, words));
  }

  // the pubkeys are the custodians fundingkeys. we don't tweak like we do with normal addresses
  public toMultisig(testnet: boolean = true, pubkeys: PublicKey[], redeemReq: number) {
    const prefix = testnet ? 'tb' : 'bc';

    // OP_RESERVED =
    const OP_INT_BASE = 80;
    // OP_CHECKMULTISIG =
    const OP_CHECKMULTISIG = 174;

    // M (n - x)
    const U = buffutils.fromUint8(OP_INT_BASE + redeemReq);

    // N
    const R = buffutils.fromUint8(OP_INT_BASE + pubkeys.length + 1);

    const redeem = buffutils.concat(
      U,
      new Uint8Array([33]),
      this.buffer,
      ...pubkeys.map(pk => buffutils.concat(new Uint8Array([33]), pk.buffer)),
      R,
      buffutils.fromUint8(OP_CHECKMULTISIG)
    );

    const hashRedeem = SHA256.digest(redeem);
    const words = bech32.toWords(hashRedeem);

    const version = new Uint8Array(1); // [0]
    return bech32.encode(prefix, buffutils.concat(version, words));
  }

  public toNestedBitcoinAddress(testnet: boolean = true): string {
    const prefix = testnet ? 0xc4 : 0x05;
    const pubkeyHash = rmd160sha256(this.buffer);
    // redeem script
    const redeem = rmd160sha256(buffutils.concat(new Uint8Array([0x00, 0x14]), pubkeyHash));
    // const rmdsha =  rmd160sha256(redeem)
    const addbytes = buffutils.concat(new Uint8Array([prefix]), redeem);
    const sha2 = SHA256.digest(SHA256.digest(addbytes)).slice(0, 4);
    // const checksum = sha2.slice(0, 4)
    const binary = buffutils.concat(addbytes, sha2);
    return encode(binary);
  }
  public toLegacyBitcoinAddress(testnet: boolean = false): string {
    const prefix = testnet ? 0x6f : 0x00;

    const hash = rmd160sha256(this.buffer);

    const concatVersion = buffutils.concat(new Uint8Array([prefix]), hash);

    const sha = SHA256.digest(SHA256.digest(concatVersion)).slice(0, 4);

    const enc = buffutils.concat(concatVersion, sha);
    return encode(enc);
  }
}

function rmd160sha256(data: Uint8Array) {
  return RIPEMD160.digest(SHA256.digest(data));
}
