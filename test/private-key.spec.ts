import { strictEqual } from 'assert';
import 'mocha';
import PrivateKey from '../src/private-key';
import PublicKey from '../src/public-key';

describe('PrivateKey', () => {
  it('should generate and serialize', () => {
    const pk = PrivateKey.fromRand(); // randomized

    const serialized = pk.toBech(); // e.g. privtm1gvaptguf6gp9emxyglqcgeuhvf6n0fgzahl5xce9gugqky77vyxs92sv8p

    const pk2 = PrivateKey.fromBech(serialized); // load it up
    if (pk2 instanceof Error) {
      throw pk2;
    }

    strictEqual(pk2.toBech(), serialized);

    pk2.toWif(); // make sure it doesn't throw
  });

  it('should create a pubkey, which serializes', () => {
    const priv = PrivateKey.fromRand(); // randomized
    const pub = priv.toPublicKey();

    const serialized = pub.toBech();

    const pub2 = PublicKey.fromBech(serialized);
    if (pub2 instanceof Error) {
      throw pub2;
    }

    strictEqual(pub2.toBech(), serialized);
  });

  it('should derive properly', async () => {
    const priv = PrivateKey.fromRand(); // randomized
    const pub = priv.toPublicKey();

    const privD = await priv.derive(new TextEncoder().encode('cat soup'));
    const pubD = await pub.derive(new TextEncoder().encode('cat soup'));

    strictEqual(privD.toPublicKey().toBech(), pubD.toBech());
  });
});
