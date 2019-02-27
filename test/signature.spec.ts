import { strictEqual } from 'assert';
import PrivateKey from '../src/private-key';
import Signature from '../src/signature';

describe('signature', () => {
  it('should work', async () => {
    const priv = PrivateKey.fromRand();

    const message = Buffer.from('Wow, such a message');

    const sig = await Signature.compute(message, priv);

    const serialized = sig.toBech();

    const sig2 = Signature.fromBech(serialized);
    if (sig2 instanceof Error) {
      throw sig2;
    }

    strictEqual(sig2.toBech(), serialized);

    strictEqual(await sig2.verify(message, priv.toPublicKey()), true);
  });
});
