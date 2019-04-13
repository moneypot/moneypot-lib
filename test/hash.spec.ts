import { strictEqual } from 'assert';
import 'mocha';
import Hash from '../src/hash';
import * as Buffutils from '../src/util/buffutils';

describe('hash', () => {
  it('should match test vector', () => {
    const input = Buffer.from('hello world');
    const output = 'd1596e0d4280f2bd2d311ce0819f23bde0dc834d8254b92924088de94c38d922';

    const hash = Hash.fromMessage('test', input);
    const serialized = hash.toPOD();

    const hash2 = Hash.fromPOD(serialized);
    if (hash2 instanceof Error) {
      throw hash2;
    }

    strictEqual(Buffutils.toHex(hash2.buffer), output);
  });
});
