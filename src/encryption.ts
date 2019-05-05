import Hash from './hash';
import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as ecc from './util/ecc';

import * as aes from './util/aes-gcm';


export function encryptToPublicKey(message: Uint8Array, ourPriv: PrivateKey, theirPub: PublicKey) {

  const sharedPoint = ecc.pointMultiply(theirPub, ourPriv.scalar);
  const sharedSecret = Hash.fromMessage('sharedSecret', ecc.Point.toBytes(sharedPoint)).buffer;


  return aes.encrypt(message, sharedSecret);
}


export function decrypt(payload: aes.EncryptedMessage, ourPriv: PrivateKey, theirPub: PublicKey) {
  const sharedPoint = ecc.pointMultiply(theirPub, ourPriv.scalar);
  const sharedSecret = Hash.fromMessage('sharedSecret', ecc.Point.toBytes(sharedPoint)).buffer;

  return aes.decrypt(payload, sharedSecret);
}