export interface EncryptedMessage {
    iv: Uint8Array;
    tag: Uint8Array;
    encrypted: Uint8Array;
}
export declare function encrypt(plainText: Uint8Array, key: Uint8Array): EncryptedMessage;
export declare function decrypt(payload: EncryptedMessage, key: Uint8Array): Uint8Array;
