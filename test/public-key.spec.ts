import 'mocha';
import * as assert from 'assert';
import PublicKey from '../src/public-key';
import { bufferFromHex } from '../src/util/ecc/util';

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

  it('should convert to bitcoin address', () => {
    const scriptPubkey = Buffer.from('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 'hex');
    const scriptAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

    const pubkey = PublicKey.fromBytes(scriptPubkey);
    if (pubkey instanceof Error) {
      throw pubkey;
    }
    assert.strictEqual(pubkey.toBitcoinAddress(false), scriptAddress);
  });

  it('should convert to a P2WSH 3 out of 4 multisig', () => {
    const pubkeys = [
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
      '023e4740d0ba639e28963f3476157b7cf2fb7c6fdf4254f97099cf8670b505ea59',
      '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    ];

    let PubKeys: PublicKey[] = [];
    // skip first
    for (let index = 0; index < pubkeys.length; index++) {
      const element = pubkeys[index];
      const fBytes = bufferFromHex(element);
      if (fBytes instanceof Error) throw fBytes;

      const f = PublicKey.fromBytes(fBytes);
      if (f instanceof Error) throw f;
      PubKeys.push(f);
    }
    const scriptPubkey = Buffer.from('026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01', 'hex');
    const pubkey = PublicKey.fromBytes(scriptPubkey);
    if (pubkey instanceof Error) {
      throw pubkey;
    }

    assert.strictEqual(
      pubkey.toMultisig(false, PubKeys, 3),
      'bc1q75f6dv4q8ug7zhujrsp5t0hzf33lllnr3fe7e2pra3v24mzl8rrqtp3qul'
    );
  });

  // it('should convert to a P2TR address', () => {
  //   const scriptPubkey = Buffer.from('03ec8d1a82fe3ffed506fd74b71721682d7eae4a65c4d073f2da89626844472d37', 'hex');
  //   const scriptAddress = 'tb1pz3duf7uzwvfusz70eaujn8xh3makmd9xvrev30g9cvzeem58ffjscca4w3';

  //   const pubkey = PublicKey.fromBytes(scriptPubkey);
  //   if (pubkey instanceof Error) {
  //     throw pubkey;
  //   }

  //   assert.strictEqual(pubkey.toTaprootAddress(true), scriptAddress);
  // });
});
