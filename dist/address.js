"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const bech32 = require("./util/bech32");
const buffutils = require("./util/buffutils");
const public_key_1 = require("./public-key");
const serializedPrefix = 'hia'; // hookedin address
class Address {
    constructor(custodianPrefix, publicKey) {
        this.custodianPrefix = custodianPrefix;
        this.publicKey = publicKey;
    }
    static fromPOD(data) {
        if (typeof data !== 'string') {
            return new Error('Address.fromPOD expected a string');
        }
        const { prefix, words } = bech32.decode(data);
        if (!prefix.startsWith(serializedPrefix)) {
            return new Error('Address.fromPOD Got prefix: ' + prefix + ' but expected to start with' + serializedPrefix);
        }
        const custodianPrefix = prefix.slice(serializedPrefix.length);
        if (custodianPrefix.length != 4) {
            return new Error('custodian prefix should be 4 characters');
        }
        const pubkey = public_key_1.default.fromBytes(bech32.fromWords(words));
        if (pubkey instanceof Error) {
            return pubkey;
        }
        return new Address(custodianPrefix, pubkey);
    }
    get buffer() {
        return buffutils.concat(buffutils.fromString(this.custodianPrefix), this.publicKey.buffer);
    }
    toPOD() {
        return bech32.encode(serializedPrefix + this.custodianPrefix, bech32.toWords(this.publicKey.buffer));
    }
    hash() {
        return hash_1.default.fromMessage('Address', this.buffer);
    }
}
exports.default = Address;
//# sourceMappingURL=address.js.map