"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_key_1 = require("./public-key");
const bech32 = require("./util/bech32");
const buffutils = require("./util/buffutils");
const bitcoin_address_1 = require("./util/bitcoin-address");
const sha256_1 = require("./util/bcrypto/sha256");
const signature_1 = require("./util/ecc/signature");
const signature_2 = require("./signature");
//export declare function decode(paymentRequest: string): PaymentRequestObject;
const MAX_MILLISATS = BigInt('2100000000000000000');
const MILLISATS_PER_BTC = BigInt(1e11);
const MILLISATS_PER_MILLIBTC = BigInt(1e8);
const MILLISATS_PER_MICROBTC = BigInt(1e5);
const MILLISATS_PER_NANOBTC = BigInt(1e2);
const PICOBTC_PER_MILLISATS = BigInt(10);
// const DIVISORS = {
//   m: BigInt(1e3),
//   u: BigInt(1e6),
//   n: BigInt(1e9),
//   p: BigInt(1e12)
// }
function DIVISORS(l) {
    switch (l) {
        case 'm':
            return BigInt(1e3);
        case 'u':
            return BigInt(1e6);
        case 'n':
            return BigInt(1e9);
        case 'p':
            return BigInt(1e12);
        default:
            throw new Error('unknown denom: ' + l);
    }
}
function hrpToMillisat(hrpString) {
    let divisor, value;
    if (hrpString.slice(-1).match(/^[munp]$/)) {
        divisor = hrpString.slice(-1);
        value = hrpString.slice(0, -1);
    }
    else if (hrpString.slice(-1).match(/^[^munp0-9]$/)) {
        throw new Error('Not a valid multiplier for the amount');
    }
    else {
        value = hrpString;
    }
    if (!value.match(/^\d+$/))
        throw new Error('Not a valid human readable amount');
    let valueBN = BigInt(value);
    let millisatoshisBN = divisor ? (valueBN * MILLISATS_PER_BTC) / DIVISORS(divisor) : valueBN * MILLISATS_PER_BTC;
    if ((divisor === 'p' && valueBN % BigInt(10) != BigInt(0)) || millisatoshisBN > MAX_MILLISATS) {
        throw new Error('Amount is outside of valid range');
    }
    return millisatoshisBN;
}
function hrpToSat(hrpString) {
    let millisatoshisBN = hrpToMillisat(hrpString);
    if (millisatoshisBN % BigInt(1000) !== BigInt(0)) {
        throw new Error('Amount is outside of valid range');
    }
    return millisatoshisBN / BigInt(1000);
}
function wordsToIntBE(words) {
    let total = 0;
    for (const [index, item] of words.reverse().entries()) {
        total += item * (32 ** index);
    }
    return total;
}
function wordsToBuffer(words, trim) {
    let buffer = bech32.convert(words, 5, 8, true);
    if (trim && (words.length * 5) % 8 !== 0) {
        buffer = buffer.slice(0, -1);
    }
    return buffer;
}
const unknownTagName = 'unknownTag';
const TAGPARSERS = new Map([
    [1, (words) => buffutils.toHex(wordsToBuffer(words, true))],
    [13, (words) => buffutils.toString(wordsToBuffer(words, true))],
    [19, (words) => buffutils.toHex(wordsToBuffer(words, true))],
    [23, (words) => buffutils.toHex(wordsToBuffer(words, true))],
    [6, wordsToIntBE],
    [24, wordsToIntBE],
    [9, fallbackAddressParser],
    [3, routingInfoParser],
]);
function getUnknownParser(tagCode) {
    return (words) => ({
        tagCode,
        words: bech32.encode('unknown', words),
    });
}
// see encoder for details
function fallbackAddressParser(words, network) {
    let version = words[0];
    words = words.slice(1);
    let addressHash = wordsToBuffer(words, true);
    let address = null;
    switch (version) {
        case 17:
            address = bitcoin_address_1.toBase58Check(addressHash, network.pubKeyHash);
            break;
        case 18:
            address = bitcoin_address_1.toBase58Check(addressHash, network.scriptHash);
            break;
        case 0:
            address = bitcoin_address_1.toBech32(addressHash, version, network.bech32);
            break;
        default:
            throw new Error('unknown version: ' + version);
    }
    return {
        code: version,
        address,
        addressHash: buffutils.toHex(addressHash),
    };
}
// first convert from words to buffer, trimming padding where necessary
// parse in 51 byte chunks. See encoder for details.
function routingInfoParser(words) {
    let routes = [];
    let pubkey, shortChannelId, feeBaseMSats, feeProportionalMillionths, cltvExpiryDelta;
    let routesBuffer = wordsToBuffer(words, true);
    while (routesBuffer.length > 0) {
        pubkey = buffutils.toHex(routesBuffer.slice(0, 33)); // 33 bytes
        shortChannelId = buffutils.toHex(routesBuffer.slice(33, 41)); // 8 bytes
        feeBaseMSats = Number.parseInt(buffutils.toHex(routesBuffer.slice(41, 45)), 16); // 4 bytes
        feeProportionalMillionths = Number.parseInt(buffutils.toHex(routesBuffer.slice(45, 49)), 16); // 4 bytes
        cltvExpiryDelta = Number.parseInt(buffutils.toHex(routesBuffer.slice(49, 51)), 16); // 2 bytes
        routesBuffer = routesBuffer.slice(51);
        routes.push({
            pubkey,
            short_channel_id: shortChannelId,
            fee_base_msat: feeBaseMSats,
            fee_proportional_millionths: feeProportionalMillionths,
            cltv_expiry_delta: cltvExpiryDelta,
        });
    }
    return routes;
}
const BECH32CODES = {
    bc: 'bitcoin',
    tb: 'testnet',
    bcrt: 'regtest',
    ltc: 'litecoin',
    tltc: 'litecoin_testnet',
};
const TAGCODES = {
    payment_hash: 1,
    description: 13,
    payee_node_key: 19,
    purpose_commit_hash: 23,
    expire_time: 6,
    min_final_cltv_expiry: 24,
    fallback_address: 9,
    routing_info: 3,
};
// reverse the keys and values of TAGCODES and insert into TAGNAMES
const TAGNAMES = new Map();
for (const [k, v] of Object.entries(TAGCODES)) {
    TAGNAMES.set(v, k);
}
const bitcoinInfo = {
    hashGenesisBlock: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    port: 8333,
    portRpc: 8332,
    protocol: { magic: 3652501241 },
    bech32: 'bc',
    seedsDns: [
        'seed.bitcoin.sipa.be',
        'dnsseed.bluematt.me',
        'seed.bitcoinstats.com',
        'seed.bitcoin.jonasschnelli.ch',
        'seed.btc.petertodd.org',
        'seed.bitcoin.sprovoost.nl',
        'dnsseed.emzy.de',
    ],
    versions: { bip32: { private: 76066276, public: 76067358 }, bip44: 0, private: 128, public: 0, scripthash: 5 },
    name: 'Bitcoin',
    per1: 100000000,
    unit: 'BTC',
    messagePrefix: '\\u0018Bitcoin Signed Message:\\n',
    testnet: false,
    bip32: { public: 76067358, private: 76066276 },
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
    dustThreshold: null,
};
const testnetInfo = {
    hashGenesisBlock: '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943',
    port: 18333,
    portRpc: 18332,
    protocol: { magic: 118034699 },
    bech32: 'tb',
    seedsDns: [
        'testnet-seed.alexykot.me',
        'testnet-seed.bitcoin.schildbach.de',
        'testnet-seed.bitcoin.petertodd.org',
        'testnet-seed.bluematt.me',
    ],
    versions: { bip32: { private: 70615956, public: 70617039 }, bip44: 1, private: 239, public: 111, scripthash: 196 },
    name: 'Bitcoin',
    per1: 100000000,
    unit: 'BTC',
    messagePrefix: '\\u0018Bitcoin Signed Message:\\n',
    testnet: true,
    bip32: { public: 70617039, private: 70615956 },
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
    dustThreshold: null,
};
function tagsItems(tags, tagName) {
    let tag = tags.filter((item) => item.tagName === tagName);
    let data = tag.length > 0 ? tag[0].data : undefined;
    return data;
}
function tagsContainItem(tags, tagName) {
    return tagsItems(tags, tagName) !== undefined;
}
function isDefined(t) {
    if (t === undefined) {
        throw new Error('unexpected undefined');
    }
    return t;
}
function decode(paymentRequest) {
    if (paymentRequest.slice(0, 2).toLowerCase() !== 'ln')
        throw new Error('Not a proper lightning payment request');
    let decoded = bech32.decode(paymentRequest);
    let words = Uint8Array.from(decoded.words);
    paymentRequest = paymentRequest.toLowerCase();
    let sigWords = words.slice(-104);
    // grabbing a copy of the words for later, words will be sliced as we parse.
    let wordsNoSig = words.slice(0, -104);
    words = words.slice(0, -104);
    let sigBuffer = bech32.fromWords(sigWords);
    let recoveryFlag = sigBuffer.slice(-1)[0];
    sigBuffer = sigBuffer.slice(0, -1);
    if (!(recoveryFlag in [0, 1, 2, 3]) || sigBuffer.length !== 64) {
        throw new Error('Signature is missing or incorrect');
    }
    // Without reverse lookups, can't say that the multipier at the end must
    // have a number before it, so instead we parse, and if the second group
    // doesn't have anything, there's a good chance the last letter of the
    // coin type got captured by the third group, so just re-regex without
    // the number.
    let prefixMatches = decoded.prefix.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);
    if (prefixMatches && !prefixMatches[2])
        prefixMatches = decoded.prefix.match(/^ln(\S+)$/);
    if (!prefixMatches) {
        throw new Error('Not a proper lightning payment request');
    }
    let coinType;
    let coinNetwork;
    let p1 = prefixMatches[1];
    if (p1 === 'bc') {
        coinType = 'bitcoin';
        coinNetwork = bitcoinInfo;
    }
    else if (p1 == 'tb') {
        coinType = 'testnet';
        coinNetwork = testnetInfo;
    }
    else {
        throw new Error('Unknown coin bech32 prefix: ' + p1);
    }
    let value = prefixMatches[2];
    let satoshis, millisatoshis, removeSatoshis;
    if (value) {
        let divisor = prefixMatches[3];
        try {
            satoshis = Number(hrpToSat(value + divisor));
        }
        catch (e) {
            satoshis = null;
            removeSatoshis = true;
        }
        millisatoshis = hrpToMillisat(value + divisor);
    }
    else {
        satoshis = null;
        millisatoshis = null;
    }
    // reminder: left padded 0 bits
    let timestamp = wordsToIntBE(words.slice(0, 7));
    console.log('time stamp is: ', timestamp);
    let timestampString = new Date(timestamp * 1000).toISOString();
    words = words.slice(7); // trim off the left 7 words
    let tags = [];
    let tagName, parser, tagLength, tagWords;
    // we have no tag count to go on, so just keep hacking off words
    // until we have none.
    while (words.length > 0) {
        let tagCode = words[0];
        tagName = TAGNAMES.get(tagCode) || unknownTagName;
        parser = TAGPARSERS.get(tagCode) || getUnknownParser(tagCode);
        words = words.slice(1);
        tagLength = wordsToIntBE(words.slice(0, 2));
        words = words.slice(2);
        tagWords = words.slice(0, tagLength);
        words = words.slice(tagLength);
        // See: parsers for more comments
        tags.push({
            tagName,
            data: parser(tagWords, coinNetwork),
        });
    }
    let timeExpireDate, timeExpireDateString;
    // be kind and provide an absolute expiration date.
    // good for logs
    if (tagsContainItem(tags, isDefined(TAGNAMES.get(6)))) {
        timeExpireDate = (timestamp + isDefined(tagsItems(tags, isDefined(TAGNAMES.get(6)))));
        timeExpireDateString = new Date(timeExpireDate * 1000).toISOString();
    }
    let toSign = buffutils.concat(buffutils.fromString(decoded.prefix), bech32.convert(wordsNoSig, 5, 8, true));
    let payReqHash = sha256_1.default.digest(toSign);
    let sig = signature_2.default.fromBytes(sigBuffer);
    if (sig instanceof Error) {
        throw sig;
    }
    let sigPubkeyPoint = signature_1.ecdsaRecover(payReqHash, sig, recoveryFlag);
    let payeeNodeKey = buffutils.toHex(new public_key_1.default(sigPubkeyPoint.x, sigPubkeyPoint.y).buffer);
    const payee = tagsItems(tags, isDefined(TAGNAMES.get(19)));
    if (payee && payee !== payeeNodeKey) {
        throw new Error('Lightning Payment Request signature pubkey does not match payee pubkey');
    }
    let finalResult = {
        paymentRequest,
        complete: true,
        prefix: decoded.prefix,
        wordsTemp: bech32.encode('temp', buffutils.concat(wordsNoSig, sigWords)),
        coinType,
        satoshis,
        millisatoshis,
        timestamp,
        timestampString,
        payeeNodeKey,
        signature: buffutils.toHex(sigBuffer),
        recoveryFlag,
        tags,
    };
    if (removeSatoshis) {
        delete finalResult['satoshis'];
    }
    if (timeExpireDate) {
        finalResult = Object.assign(finalResult, { timeExpireDate, timeExpireDateString });
    }
    return orderKeys(finalResult);
}
exports.decode = decode;
function orderKeys(unorderedObj) {
    let orderedObj = {};
    Object.keys(unorderedObj)
        .sort()
        .forEach(key => {
        orderedObj[key] = unorderedObj[key];
    });
    return orderedObj;
}
//# sourceMappingURL=lightning-invoice.js.map