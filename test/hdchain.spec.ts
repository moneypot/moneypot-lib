import { strictEqual } from 'assert';
import HDChain from '../src/hdchain';

describe('hdchain', () => {
  it('handle bip84 tests', async () => {
    const hd = await HDChain.fromBase58(
      'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs'
    );

    // 0/0
    const firstZero = await hd.derive(0);

    const firstReceive = await firstZero.derive(0);

    const pub = firstReceive.toPublicKey();
    if (pub instanceof Error) {
      throw pub;
    }

    strictEqual(await pub.toBitcoinAddress(false), 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
  });
});
