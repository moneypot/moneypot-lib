import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as aes from './util/aes-gcm';
export declare function encryptToPublicKey(message: Uint8Array, ourPriv: PrivateKey, theirPub: PublicKey): aes.EncryptedMessage;
export declare function decrypt(payload: aes.EncryptedMessage, ourPriv: PrivateKey, theirPub: PublicKey): Uint8Array;
