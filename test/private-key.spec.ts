import { strictEqual } from 'assert';
import 'mocha';
import PrivateKey from '../src/private-key';
import PublicKey from '../src/public-key';

describe('PrivateKey', () => {
  it('should generate and serialize', () => {
    const pk = PrivateKey.fromRand(); // randomized

    const serialized = pk.toPOD(); // e.g. privtm1gvaptguf6gp9emxyglqcgeuhvf6n0fgzahl5xce9gugqky77vyxs92sv8p

    const pk2 = PrivateKey.fromPOD(serialized); // load it up
    if (pk2 instanceof Error) {
      throw pk2;
    }

    strictEqual(pk2.toPOD(), serialized);

    pk2.toWif(); // make sure it doesn't throw
  });

  it('should create a pubkey, which serializes', () => {
    const priv = PrivateKey.fromRand(); // randomized
    const pub = priv.toPublicKey();

    const serialized = pub.toPOD();

    const pub2 = PublicKey.fromPOD(serialized);
    if (pub2 instanceof Error) {
      throw pub2;
    }

    strictEqual(pub2.toPOD(), serialized);
  });

  it('should derive properly', () => {
    const priv = PrivateKey.fromRand(); // randomized
    const pub = priv.toPublicKey();

    const privD = priv.derive(new TextEncoder().encode('cat soup'));
    const pubD = pub.derive(new TextEncoder().encode('cat soup'));

    strictEqual(privD.toPublicKey().toPOD(), pubD.toPOD());
  });
});
