import { strictEqual } from 'assert';
import * as blind from '../src/blind';
import BlindedMessage from '../src/blinded-message';
import BlindedSignature from '../src/blinded-signature';
import Signature from '../src/signature';
import Hash from '../src/hash';
import PrivateKey from '../src/private-key';

describe('blinding', () => {
  it('should work', () => {
    const bechNonce = 'privhi1vxag33mx6p8wakp3r704mdjcuvpftz7w6um5lpkqmdpj0hmkgcsqc8ne28';
    const privNonce = PrivateKey.fromPOD(bechNonce);
    if (privNonce instanceof Error) {
      throw privNonce;
    }
    const pubNonce = privNonce.toPublicKey();

    strictEqual(pubNonce.toPOD(), 'pubhi1q0vuy9ay2zr7d9xj9tha9sajh5gyyuy9ngnrfjnhdqn9wg0kahrrq0gvzl2');

    const signerBech = 'privhi1shh3uv0s7haxp8rywj9lzcy504patz6q7p45nc33y7n8x759wyesg397sx';
    const signerPriv = PrivateKey.fromPOD(signerBech);
    if (signerPriv instanceof Error) {
      throw signerPriv;
    }

    const signerPub = signerPriv.toPublicKey();
    if (signerPub instanceof Error) {
      throw signerPub;
    }
    strictEqual(signerPub.toPOD(), 'pubhi1qw0660x727akuhnz5nmzwdew5nyudav0c26ljm822sfz6g82tjjlwpe0sra');

    const message = Buffer.from('attack at dawn');

    const secretSeed = Hash.fromMessage('seed', Buffer.from('super secret determistic seed!'));
    strictEqual(secretSeed.toPOD(), 'hshi1tdp93syjehgcc26ys4m5e0pvwd6t0u7dgdl0dcpr9p0rta29mq2sc8l35a');

    const [unblinder, blindedMessage] = blind.blindMessage(secretSeed.buffer, pubNonce, signerPub, message);

    // simulate serializing blindedMessage
    const sBlindedMessage = BlindedMessage.fromPOD(blindedMessage.toPOD());
    if (sBlindedMessage instanceof Error) {
      throw signerPub;
    }

    strictEqual(blindedMessage.toPOD(), sBlindedMessage.toPOD());

    const blindedSig = blind.blindSign(signerPriv, privNonce, sBlindedMessage);

    // simulate serializing blindedSig
    const sBlindedSig = BlindedSignature.fromPOD(blindedSig.toPOD());
    if (sBlindedSig instanceof Error) {
      throw sBlindedSig;
    }

    strictEqual(sBlindedSig.toPOD(), blindedSig.toPOD());

    const unblinded = blind.unblind(unblinder, sBlindedSig);

    // simulate serializing
    const sUnblinded = Signature.fromPOD(unblinded.toPOD());
    if (sUnblinded instanceof Error) {
      throw sUnblinded;
    }

    strictEqual(sUnblinded.toPOD(), unblinded.toPOD());

    strictEqual(unblinded.verify(message, signerPub), true);
  });
});
