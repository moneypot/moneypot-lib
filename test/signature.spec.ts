import { strictEqual } from 'assert';
import PrivateKey from '../src/private-key';
import Signature from '../src/signature';
import PublicKey from '../src/public-key';

describe('signature', () => {
  it('should work', () => {
    const priv = PrivateKey.fromRand();

    const message = Buffer.from('Wow, such a message');

    const sig = Signature.compute(message, priv);

    const serialized = sig.toPOD();

    const sig2 = Signature.fromPOD(serialized);
    if (sig2 instanceof Error) {
      throw sig2;
    }

    strictEqual(sig2.toPOD(), serialized);

    strictEqual(sig2.verify(message, priv.toPublicKey()), true);
  });

  it('should handle aggregation', () => {
    const priv1 = PrivateKey.fromRand();
    const priv2 = PrivateKey.fromRand();

    const message = Buffer.from('Wow, such a message');

    const priv = PrivateKey.combine([priv1, priv2]);

    const pub = PublicKey.combine([priv1.toPublicKey(), priv2.toPublicKey()]);

    const sig = Signature.compute(message, priv);

    strictEqual(sig.verify(message, pub), true);

    strictEqual(priv.toPublicKey().toPOD(), pub.toPOD());
  });
});
