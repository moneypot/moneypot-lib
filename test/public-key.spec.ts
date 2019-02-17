import 'mocha';
import * as assert from 'assert';
import PublicKey from '../src/public-key';

describe('public key', () => {
  it('should convert to bitcoin address', () => {
    const scriptPubkey = Buffer.from('02f928f52e707e79487d488f89f89145861cf6764ec03cf16474917f828070fbfb', 'hex');
    const scriptAddress = 'bc1qahgfjnj5z3j2w5kdmucdp3nt86892l550u3v3n';

    const pubkey = PublicKey.fromBytes(scriptPubkey);
    if (pubkey instanceof Error) {
      throw pubkey;
    }

    assert.strictEqual(pubkey.toBitcoinAddress(false), scriptAddress);
  });
});
