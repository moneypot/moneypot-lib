/*
  An address is just a trivial wrapper around a public key. The main point is just to make sure it's used correctly
  (e.g. you can only send to an address). And we'll do versioning here when the time comes
 */

import PublicKey from './public-key';
import * as bech32 from './util/bech32';

const serializedPrefix = 'hia'; // hookedin address

export default class Address {
  public static fromBech(serialized: string) {
    const { prefix, words } = bech32.decode(serialized);

    if (prefix !== serializedPrefix) {
      throw new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return PublicKey.fromBytes(bech32.fromWords(words));
  }
  public publicKey: PublicKey;

  constructor(pub: PublicKey) {
    this.publicKey = pub;
  }

  public toBech() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.publicKey.buffer));
  }
}
