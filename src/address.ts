import Hash from './hash';

import * as bech32 from './util/bech32';

import * as buffutils from './util/buffutils';

import PublicKey from './public-key';

const serializedPrefix = 'hia'; // hookedin address

export default class Address {
  custodianPrefix: string;
  publicKey: PublicKey;

  constructor(custodianPrefix: string, publicKey: PublicKey) {
    this.custodianPrefix = custodianPrefix;
    this.publicKey = publicKey;
  }

  public static fromPOD(data: any): Address | Error {
    if (typeof data !== 'string') {
      return new Error('Address.fromPOD expected a string');
    }

    const { prefix, words } = bech32.decode(data);

    if (!prefix.startsWith(serializedPrefix)) {
      return new Error('Address.fromPOD Got prefix: ' + prefix + ' but expected to start with' + serializedPrefix);
    }

    const custodianPrefix = prefix.slice(serializedPrefix.length);
    if (custodianPrefix.length != 4) {
      return new Error('custodian prefix should be 4 characters');
    }

    const pubkey = PublicKey.fromBytes(bech32.fromWords(words));
    if (pubkey instanceof Error) {
      return pubkey;
    }

    return new Address(custodianPrefix, pubkey);
  }

  public get buffer(): Uint8Array {
    return buffutils.concat(buffutils.fromString(this.custodianPrefix), this.publicKey.buffer);
  }

  public toPOD() {
    return bech32.encode(serializedPrefix + this.custodianPrefix, bech32.toWords(this.publicKey.buffer));
  }

  public hash() {
    return Hash.fromMessage('Address', this.buffer);
  }
}
