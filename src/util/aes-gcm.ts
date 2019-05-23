import * as crypto from 'crypto';
import random from './random';
import * as Buffutils from './buffutils';

export interface EncryptedMessage {
  iv: Uint8Array;
  tag: Uint8Array;
  encrypted: Uint8Array;
}

export function encrypt(plainText: Uint8Array, key: Uint8Array): EncryptedMessage {
  const iv = random(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const start = cipher.update(plainText);
  const end = cipher.final();

  const encrypted = Buffutils.concat(start, end);

  const tag = cipher.getAuthTag();

  return {
    iv,
    tag,
    encrypted,
  };
}

export function decrypt(payload: EncryptedMessage, key: Uint8Array): Uint8Array {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.iv);
  decipher.setAuthTag(payload.tag);

  // encrypt the given text
  const start = decipher.update(payload.encrypted);
  const end = decipher.final();

  return Buffutils.concat(start, end);
}
