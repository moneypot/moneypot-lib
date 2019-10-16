import PublicKey from './public-key';
import * as bech32 from './util/bech32';
import * as buffutils from './util/buffutils';
import { toBase58Check, toBech32 } from './util/bitcoin-address';
import Sha256 from './util/bcrypto/sha256';
import * as ecc from './util/ecc';
import { ecdsaRecover } from './util/ecc/signature';
import Signature from './signature';
import * as bs58check from './util/bs58check';

type RoutingInfo = Array<{
  pubkey: string;
  short_channel_id: string;
  fee_base_msat: number;
  fee_proportional_millionths: number;
  cltv_expiry_delta: number;
}>;
type FallbackAddress = {
  code: number;
  address: string;
  addressHash: string;
};

// Start exports
export declare type TagData = string | number | RoutingInfo | FallbackAddress;
export declare type PaymentRequestObject = {
  complete: boolean;
  prefix: string;
  wordsTemp: string;
  coinType: string;
  satoshis?: number;
  millisatoshis?: bigint;
  timestamp: number;
  timestampString: string;
  timeExpireDate?: number;
  timeExpireDateString?: string;
  payeeNodeKey: string;
  signature: string;
  recoveryFlag: number;
  tags: Array<{
    tagName: string;
    data: TagData;
  }>;
};

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

function DIVISORS(l: string) {
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

function hrpToMillisat(hrpString: string) {
  let divisor, value;
  if (hrpString.slice(-1).match(/^[munp]$/)) {
    divisor = hrpString.slice(-1);
    value = hrpString.slice(0, -1);
  } else if (hrpString.slice(-1).match(/^[^munp0-9]$/)) {
    throw new Error('Not a valid multiplier for the amount');
  } else {
    value = hrpString;
  }

  if (!value.match(/^\d+$/)) throw new Error('Not a valid human readable amount');

  let valueBN = BigInt(value);

  let millisatoshisBN = divisor ? (valueBN * MILLISATS_PER_BTC) / DIVISORS(divisor) : valueBN * MILLISATS_PER_BTC;

  if ((divisor === 'p' && valueBN % BigInt(10) != BigInt(0)) || millisatoshisBN > MAX_MILLISATS) {
    throw new Error('Amount is outside of valid range');
  }

  return millisatoshisBN;
}

function hrpToSat(hrpString: string): bigint {
  let millisatoshisBN = hrpToMillisat(hrpString);

  if (millisatoshisBN % BigInt(1000) !== BigInt(0)) {
    throw new Error('Amount is outside of valid range');
  }

  return millisatoshisBN / BigInt(1000);
}

function wordsToIntBE(words: Uint8Array | (number[])): number {
  let total = 0;
  for (const [index, item] of words.reverse().entries()) {
    total += item * 32 ** index;
  }

  return total;
}

function wordsToBuffer(words: Uint8Array, trim: boolean) {
  let buffer = bech32.convert(words, 5, 8, true);
  if (trim && (words.length * 5) % 8 !== 0) {
    buffer = buffer.slice(0, -1);
  }
  return buffer;
}

const unknownTagName = 'unknownTag';

type Network = { pubKeyHash: number; scriptHash: number; bech32: string };

const TAGPARSERS = new Map<number, (words: Uint8Array, network: Network) => any>([
  [1, (words: Uint8Array) => buffutils.toHex(wordsToBuffer(words, true))], // 256 bits
  [13, (words: Uint8Array) => buffutils.toString(wordsToBuffer(words, true))], // string variable length
  [19, (words: Uint8Array) => buffutils.toHex(wordsToBuffer(words, true))], // 264 bits
  [23, (words: Uint8Array) => buffutils.toHex(wordsToBuffer(words, true))], // 256 bits
  [6, wordsToIntBE], // default: 3600 (1 hour)]
  [24, wordsToIntBE], // default: 9
  [9, fallbackAddressParser],
  [3, routingInfoParser], // for extra routing info (private etc.)
]);

function getUnknownParser(tagCode: number) {
  return (words: Uint8Array) => ({
    tagCode,
    words: bech32.encode('unknown', words),
  });
}

// see encoder for details
function fallbackAddressParser(words: Uint8Array, network: Network) {
  let version = words[0];
  words = words.slice(1);

  let addressHash = wordsToBuffer(words, true);

  let address = null;

  switch (version) {
    case 17:
      address = toBase58Check(addressHash, network.pubKeyHash);
      break;
    case 18:
      address = toBase58Check(addressHash, network.scriptHash);
      break;
    case 0:
      address = toBech32(addressHash, version, network.bech32);
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
function routingInfoParser(words: Uint8Array) {
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
  purpose_commit_hash: 23, // commit to longer descriptions (like a website)
  expire_time: 6, // default: 3600 (1 hour)
  min_final_cltv_expiry: 24, // default: 9
  fallback_address: 9,
  routing_info: 3, // for extra routing info (private etc.)
};

// reverse the keys and values of TAGCODES and insert into TAGNAMES
const TAGNAMES = new Map<number, string>();
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

function tagsItems<T extends { tagName: string; data: any }>(tags: T[], tagName: string) {
  let tag = tags.filter((item: any) => item.tagName === tagName);
  let data = tag.length > 0 ? tag[0].data : undefined;
  return data;
}

function tagsContainItem<T extends { tagName: string; data: any }>(tags: T[], tagName: string) {
  return tagsItems(tags, tagName) !== undefined;
}

function isDefined<T>(t: T | undefined): T {
  if (t === undefined) {
    throw new Error('unexpected undefined');
  }

  return t;
}

export function decodeBolt11(paymentRequest: string): PaymentRequestObject | Error {
  if (paymentRequest.slice(0, 2).toLowerCase() !== 'ln') {
    return new Error('Not a proper lightning payment request');
  }

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
    return new Error('Signature is missing or incorrect');
  }

  // Without reverse lookups, can't say that the multipier at the end must
  // have a number before it, so instead we parse, and if the second group
  // doesn't have anything, there's a good chance the last letter of the
  // coin type got captured by the third group, so just re-regex without
  // the number.
  let prefixMatches = decoded.prefix.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);
  if (prefixMatches && !prefixMatches[2]) prefixMatches = decoded.prefix.match(/^ln(\S+)$/);
  if (!prefixMatches) {
    return new Error('Not a proper lightning payment request');
  }

  let coinType;
  let coinNetwork;

  let p1 = prefixMatches[1];
  if (p1 === 'bc') {
    coinType = 'bitcoin';
    coinNetwork = bitcoinInfo;
  } else if (p1 == 'tb') {
    coinType = 'testnet';
    coinNetwork = testnetInfo;
  } else {
    return new Error('Unknown coin bech32 prefix: ' + p1);
  }

  let value = prefixMatches[2];
  let satoshis, millisatoshis;
  if (value) {
    let divisor = prefixMatches[3];
    satoshis = Number(hrpToSat(value + divisor));
    millisatoshis = hrpToMillisat(value + divisor);
  } else {
    satoshis = undefined;
    millisatoshis = undefined;
  }

  // reminder: left padded 0 bits
  let timestamp = wordsToIntBE(words.slice(0, 7));
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
      data: parser(tagWords, coinNetwork), // only fallback address needs coinNetwork
    });
  }

  let timeExpireDate, timeExpireDateString;
  // be kind and provide an absolute expiration date.
  // good for logs
  if (tagsContainItem(tags, isDefined(TAGNAMES.get(6)))) {
    timeExpireDate = (timestamp + isDefined(tagsItems(tags, isDefined(TAGNAMES.get(6))))) as number;
    timeExpireDateString = new Date(timeExpireDate * 1000).toISOString();
  }

  let toSign = buffutils.concat(buffutils.fromString(decoded.prefix), bech32.convert(wordsNoSig, 5, 8, true));

  let payReqHash = Sha256.digest(toSign);

  let sig = Signature.fromBytes(sigBuffer);
  if (sig instanceof Error) {
    return sig;
  }

  let sigPubkeyPoint = ecdsaRecover(payReqHash, sig, recoveryFlag);
  let payeeNodeKey = buffutils.toHex(new PublicKey(sigPubkeyPoint.x, sigPubkeyPoint.y).buffer);

  const payee = tagsItems(tags, isDefined(TAGNAMES.get(19)));
  if (payee && payee !== payeeNodeKey) {
    return new Error('Lightning Payment Request signature pubkey does not match payee pubkey');
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

  if (timeExpireDate) {
    finalResult = Object.assign(finalResult, { timeExpireDate, timeExpireDateString });
  }

  return orderKeys(finalResult);
}

function orderKeys<T extends any>(unorderedObj: T): T {
  let orderedObj: any = {};
  Object.keys(unorderedObj)
    .sort()
    .forEach(key => {
      orderedObj[key] = unorderedObj[key];
    });
  return orderedObj;
}

function satToHrp(satoshis: bigint): string {
  if (!satoshis.toString().match(/^\d+$/)) {
    throw new Error('satoshis must be an integer');
  }
  let millisatoshisBN = BigInt(satoshis);
  return millisatToHrp(millisatoshisBN * BigInt(1000));
}

function millisatToHrp(millisatoshis: bigint): string {
  if (!millisatoshis.toString().match(/^\d+$/)) {
    throw new Error('millisatoshis must be an integer');
  }

  let millisatoshisString = millisatoshis.toString();
  let millisatoshisLength = millisatoshisString.length;
  let divisorString, valueString;
  if (millisatoshisLength > 11 && /0{11}$/.test(millisatoshisString)) {
    divisorString = '';
    valueString = (millisatoshis / MILLISATS_PER_BTC).toString();
  } else if (millisatoshisLength > 8 && /0{8}$/.test(millisatoshisString)) {
    divisorString = 'm';
    valueString = (millisatoshis / MILLISATS_PER_MILLIBTC).toString();
  } else if (millisatoshisLength > 5 && /0{5}$/.test(millisatoshisString)) {
    divisorString = 'u';
    valueString = (millisatoshis / MILLISATS_PER_MICROBTC).toString();
  } else if (millisatoshisLength > 2 && /0{2}$/.test(millisatoshisString)) {
    divisorString = 'n';
    valueString = (millisatoshis / MILLISATS_PER_NANOBTC).toString();
  } else {
    divisorString = 'p';
    valueString = (millisatoshis * PICOBTC_PER_MILLISATS).toString();
  }
  return valueString + divisorString;
}

function unknownEncoder(data: any) {
  data.words = bech32.decode(data.words).words;
  return data;
}

const TAGENCODERS = {
  payment_hash: hexToWord, // 256 bits
  description: textToWord, // string variable length
  payee_node_key: hexToWord, // 264 bits
  purpose_commit_hash: purposeCommitEncoder, // 256 bits
  expire_time: intBEToWords, // default: 3600 (1 hour)
  min_final_cltv_expiry: intBEToWords, // default: 9
  fallback_address: fallbackAddressEncoder,
  routing_info: routingInfoEncoder, // for extra routing info (private etc.)
};
type TAGENCODERSKEY = keyof typeof TAGENCODERS;

function hexToWord(hex: string) {
  let buffer = buffutils.fromHex(hex);
  if (buffer instanceof Error) {
    throw new Error('invalid hex');
  }
  return bech32.toWords(buffer);
}

function textToWord(text: string) {
  let buffer = buffutils.fromString(text);
  let words = bech32.toWords(buffer);
  return words;
}

// if text, return the sha256 hash of the text as words.
// if hex, return the words representation of that data.
function purposeCommitEncoder(data: string) {
  let buffer = buffutils.fromHex(data);
  if (buffer instanceof Error) {
    buffer = Sha256.digest(buffutils.fromString(data));
  }
  return bech32.toWords(buffer);
}

// the code is the witness version OR 17 for P2PKH OR 18 for P2SH
// anything besides code 17 or 18 should be bech32 encoded address.
// 1 word for the code, and right pad with 0 if necessary for the addressHash
// (address parsing for encode is done in the encode function)
function fallbackAddressEncoder(data: FallbackAddress, network: any) {
  return buffutils.concat(Uint8Array.of(data.code), hexToWord(data.addressHash));
}

// routing info is encoded first as a large buffer
// 51 bytes for each channel
// 33 byte pubkey, 8 byte short_channel_id, 4 byte millisatoshi base fee (left padded)
// 4 byte fee proportional millionths and a 2 byte left padded CLTV expiry delta.
// after encoding these 51 byte chunks and concatenating them
// convert to words right padding 0 bits.
function routingInfoEncoder(datas: RoutingInfo) {
  let buffer = Buffer.from([]);

  datas.forEach(data => {
    const pubkeybuff = buffutils.fromHex(data.pubkey);
    if (pubkeybuff instanceof Error) {
      throw new Error('data.pubkey was not hex');
    }

    const shortChannelBuff = buffutils.fromHex(data.short_channel_id);
    if (shortChannelBuff instanceof Error) {
      throw new Error('data.hexToBuffer was not hex');
    }

    buffer = Buffer.concat([buffer, pubkeybuff]);
    buffer = Buffer.concat([buffer, shortChannelBuff]);
    buffer = Buffer.concat([buffer, Buffer.from([0, 0, 0].concat(...intBEToWords(data.fee_base_msat, 8)).slice(-4))]);
    buffer = Buffer.concat([
      buffer,
      Buffer.from([0, 0, 0].concat(...intBEToWords(data.fee_proportional_millionths, 8)).slice(-4)),
    ]);
    buffer = Buffer.concat([buffer, Buffer.from([0].concat(...intBEToWords(data.cltv_expiry_delta, 8)).slice(-2))]);
  });

  return bech32.toWords(buffer);
}

export function encodeBolt11(paymentRequest: PaymentRequestObject) {
  let data = { ...paymentRequest }; // make a copy, but careful as it's not a deep copy
  data.tags = [...paymentRequest.tags]; // deep copy the tags

  let canReconstruct = !(data.signature === undefined || data.recoveryFlag === undefined);

  // if no cointype is defined, set to testnet
  let coinTypeObj;
  if (data.coinType === undefined && !canReconstruct) {
    data.coinType = 'testnet';
    coinTypeObj = testnetInfo;
  } else if (data.coinType === undefined && canReconstruct) {
    throw new Error('Need coinType for proper payment request reconstruction');
  } else {
    if (data.coinType === 'bitcoin') {
      coinTypeObj = bitcoinInfo;
    } else if (data.coinType === 'testnet') {
      coinTypeObj = testnetInfo;
    } else {
      throw new Error('Unknown coin type: ' + data.coinType);
    }
  }

  // use current time as default timestamp (seconds)
  if (data.timestamp === undefined && !canReconstruct) {
    data.timestamp = Math.floor(new Date().getTime() / 1000);
  } else if (data.timestamp === undefined && canReconstruct) {
    throw new Error('Need timestamp for proper payment request reconstruction');
  }

  if (data.tags === undefined) throw new Error('Payment Requests need tags array');

  // If no payment hash, fail
  if (!tagsContainItem(data.tags, isDefined(TAGNAMES.get(1)))) {
    throw new Error('Lightning Payment Request needs a payment hash');
  }
  // If no description or purpose commit hash/message, fail
  if (
    !tagsContainItem(data.tags, isDefined(TAGNAMES.get(13))) &&
    !tagsContainItem(data.tags, isDefined(TAGNAMES.get(23)))
  ) {
    data.tags.push({
      tagName: isDefined(TAGNAMES.get(13)),
      data: '',
    });
  }

  // If a description exists, check to make sure the buffer isn't greater than
  // 639 bytes long, since 639 * 8 / 5 = 1023 words (5 bit) when padded
  if (
    tagsContainItem(data.tags, isDefined(TAGNAMES.get(13))) &&
    Buffer.from(tagsItems(data.tags, isDefined(TAGNAMES.get(13))), 'utf8').length > 639
  ) {
    throw new Error('Description is too long: Max length 639 bytes');
  }

  // if there's no expire time, and it is not reconstructing (must have private key)
  // default to adding a 3600 second expire time (1 hour)
  if (!tagsContainItem(data.tags, isDefined(TAGNAMES.get(6))) && !canReconstruct) {
    data.tags.push({
      tagName: isDefined(TAGNAMES.get(6)),
      data: 3600,
    });
  }

  // if there's no minimum cltv time, and it is not reconstructing (must have private key)
  // default to adding a 9 block minimum cltv time (90 minutes for bitcoin)
  if (!tagsContainItem(data.tags, isDefined(TAGNAMES.get(24))) && !canReconstruct) {
    data.tags.push({
      tagName: isDefined(TAGNAMES.get(24)),
      data: 9,
    });
  }

  let nodePublicKey, tagNodePublicKey;
  // If there is a payee_node_key tag convert to buffer
  if (tagsContainItem(data.tags, isDefined(TAGNAMES.get(19)))) {
    tagNodePublicKey = buffutils.fromHex(tagsItems(data.tags, isDefined(TAGNAMES.get(19))));
    if (tagNodePublicKey instanceof Error) {
      throw new Error('tag19 was not hex encoded');
    }
  }
  // If there is payeeNodeKey attribute, convert to buffer
  if (data.payeeNodeKey) {
    nodePublicKey = buffutils.fromHex(data.payeeNodeKey);
    if (nodePublicKey instanceof Error) {
      throw new Error('payeeNodeKey was not hex encoded');
    }
  }
  if (nodePublicKey && tagNodePublicKey && !buffutils.equal(tagNodePublicKey, nodePublicKey)) {
    throw new Error('payeeNodeKey and tag payee node key do not match');
  }
  // in case we have one or the other, make sure it's in nodePublicKey
  nodePublicKey = nodePublicKey || tagNodePublicKey;
  if (nodePublicKey) {
    data.payeeNodeKey = buffutils.toHex(nodePublicKey);
  }

  let code, addressHash, address;
  // If there is a fallback address tag we must check it is valid
  if (tagsContainItem(data.tags, isDefined(TAGNAMES.get(9)))) {
    let addrData = tagsItems(data.tags, isDefined(TAGNAMES.get(9)));
    // Most people will just provide address so Hash and code will be undefined here
    address = addrData.address;
    addressHash = addrData.addressHash;
    code = addrData.code;

    if (addressHash === undefined || code === undefined) {
      let bech32addr, base58addr;
      try {
        const payload = bech32.decode(address);
        bech32addr = {
          hash: bech32.fromWords(payload.words.slice(1)),
          version: payload.words[0],
          prefix: payload.prefix,
        };
        code = bech32addr.version;
        addressHash = bech32addr.hash;
      } catch (e) {
        try {
          const payload = bs58check.decode(address); // this throws
          if (payload.length < 21) throw new Error(address + ' is too short');
          if (payload.length > 21) throw new Error(address + ' is too long');

          base58addr = {
            version: payload[0],
            hash: payload.slice(1),
          };

          if (base58addr.version === coinTypeObj.pubKeyHash) {
            code = 17;
          } else if (base58addr.version === coinTypeObj.scriptHash) {
            code = 18;
          } else {
            throw new Error('unrecognized address version: ' + base58addr.version);
          }
          addressHash = base58addr.hash;
        } catch (f) {
          throw new Error('Fallback address (' + address + ') is unknown');
        }
      }
      if (bech32addr && !(bech32addr.version !== 0)) {
        throw new Error('Fallback address witness version is unknown');
      }
      if (bech32addr && bech32addr.prefix !== coinTypeObj.bech32) {
        throw new Error('Fallback address network type does not match payment request network type');
      }
      if (
        base58addr &&
        base58addr.version !== coinTypeObj.pubKeyHash &&
        base58addr.version !== coinTypeObj.scriptHash
      ) {
        throw new Error('Fallback address version (base58) is unknown or the network type is incorrect');
      }

      // FIXME: If addressHash or code is missing, add them to the original Object
      // after parsing the address value... this changes the actual attributes of the data object.
      // Not very clean.
      // Without this, a person can not specify a fallback address tag with only the address key.
      addrData.addressHash = buffutils.toHex(addressHash);
      addrData.code = code;
    }
  }

  // If there is route info tag, check that each route has all 4 necessary info
  if (tagsContainItem(data.tags, isDefined(TAGNAMES.get(3)))) {
    let routingInfo = tagsItems(data.tags, isDefined(TAGNAMES.get(3)));
    routingInfo.forEach((route: any) => {
      if (
        route.pubkey === undefined ||
        route.short_channel_id === undefined ||
        route.fee_base_msat === undefined ||
        route.fee_proportional_millionths === undefined ||
        route.cltv_expiry_delta === undefined
      ) {
        throw new Error('Routing info is incomplete');
      }
      if (ecc.Point.fromHex(route.pubkey) instanceof Error) {
        throw new Error('Routing info pubkey is not a valid pubkey');
      }
      let shortId = buffutils.fromHex(route.short_channel_id);
      if (shortId instanceof Error || shortId.length !== 8) {
        throw new Error('Routing info short channel id must be 8 bytes');
      }
      if (typeof route.fee_base_msat !== 'number' || Math.floor(route.fee_base_msat) !== route.fee_base_msat) {
        throw new Error('Routing info fee base msat is not an integer');
      }
      if (
        typeof route.fee_proportional_millionths !== 'number' ||
        Math.floor(route.fee_proportional_millionths) !== route.fee_proportional_millionths
      ) {
        throw new Error('Routing info fee proportional millionths is not an integer');
      }
      if (
        typeof route.cltv_expiry_delta !== 'number' ||
        Math.floor(route.cltv_expiry_delta) !== route.cltv_expiry_delta
      ) {
        throw new Error('Routing info cltv expiry delta is not an integer');
      }
    });
  }

  let prefix = 'ln';
  prefix += coinTypeObj.bech32;

  let hrpString;
  // calculate the smallest possible integer (removing zeroes) and add the best
  // divisor (m = milli, u = micro, n = nano, p = pico)
  if (data.millisatoshis && data.satoshis) {
    hrpString = millisatToHrp(data.millisatoshis);
    let hrpStringSat = satToHrp(BigInt(data.satoshis));
    if (hrpStringSat !== hrpString) {
      throw new Error('satoshis and millisatoshis do not match');
    }
  } else if (data.millisatoshis) {
    hrpString = millisatToHrp(data.millisatoshis);
  } else if (data.satoshis) {
    hrpString = satToHrp(BigInt(data.satoshis));
  } else {
    hrpString = '';
  }

  // bech32 human readable part is lnbc2500m (ln + coinbech32 + satoshis (optional))
  // lnbc or lntb would be valid as well. (no value specified)
  prefix += hrpString;

  // timestamp converted to 5 bit number array (left padded with 0 bits, NOT right padded)
  let timestampWords = intBEToWords(data.timestamp);

  let tags = data.tags;
  let tagWords = Uint8Array.from([]);
  tags.forEach(tag => {
    const possibleTagNames = Object.keys(TAGENCODERS);
    if (canReconstruct) possibleTagNames.push(unknownTagName);
    // check if the tagName exists in the encoders object, if not throw Error.
    if (possibleTagNames.indexOf(tag.tagName) === -1) {
      throw new Error('Unknown tag key: ' + tag.tagName);
    }

    let words;
    if (tag.tagName !== unknownTagName) {
      // each tag starts with 1 word code for the tag
      tagWords = buffutils.concat(tagWords, Uint8Array.of(TAGCODES[tag.tagName as TAGENCODERSKEY]));

      const encoder: any = TAGENCODERS[tag.tagName as TAGENCODERSKEY];
      words = encoder(tag.data);
    } else {
      let result = unknownEncoder(tag.data);
      tagWords = buffutils.concat(tagWords, result.tagCode);
      words = result.words;
    }
    // after the tag code, 2 words are used to store the length (in 5 bit words) of the tag data
    // (also left padded, most integers are left padded while buffers are right padded)
    tagWords = buffutils.concat(
      tagWords,
      buffutils.slice(buffutils.concat(Uint8Array.of(0), intBEToWords(words.length)), -2)
    );
    // then append the tag data words
    tagWords = buffutils.concat(tagWords, words);
  });

  // the data part of the bech32 is TIMESTAMP || TAGS || SIGNATURE
  // currently dataWords = TIMESTAMP || TAGS
  let dataWords = buffutils.concat(timestampWords, tagWords);

  // the preimage for the signing data is the buffer of the prefix concatenated
  // with the buffer conversion of the data words excluding the signature
  // (right padded with 0 bits)
  //Buffer.concat([Buffer.from(prefix, 'utf8'), Buffer.from(convert(dataWords, 5, 8))])
  let toSign = buffutils.concat(buffutils.fromString(prefix), bech32.convert(dataWords, 5, 8, true));
  // single SHA256 hash for the signature
  let payReqHash = Sha256.digest(toSign);

  // signature is 64 bytes (32 byte r value and 32 byte s value concatenated)
  // PLUS one extra byte appended to the right with the recoveryID in [0,1,2,3]
  // Then convert to 5 bit words with right padding 0 bits.
  let sigWords;
  if (canReconstruct) {
    /* Since BOLT11 does not require a payee_node_key tag in the specs,
    most parsers will have to recover the pubkey from the signature
    To ensure the tag data has been provided in the right order etc.
    we should check that the data we got and the node key given match when
    reconstructing a payment request from given signature and recoveryID.
    However, if a privatekey is given, the caller is the privkey owner.
    Earlier we check if the private key matches the payee node key IF they
    gave one. */
    if (nodePublicKey) {
      //let recoveredPubkey = secp256k1.recover(payReqHash, Buffer.from(data.signature, 'hex'), data.recoveryFlag, true)
      if (!data.signature || data.recoveryFlag === undefined) {
        throw new Error('expected signature/recoveryFlag to recover pubkey');
      }

      const sig = ecc.Signature.fromHex(data.signature);
      if (sig instanceof Error) {
        throw new Error('expected signature to be valid hex');
      }

      let recoveredPubkey = ecc.Point.toBytes(ecdsaRecover(payReqHash, sig, data.recoveryFlag));
      if (nodePublicKey && !buffutils.equal(nodePublicKey, recoveredPubkey)) {
        throw new Error('Signature, message, and recoveryID did not produce the same pubkey as payeeNodeKey');
      }
      sigWords = hexToWord(data.signature + '0' + data.recoveryFlag);
    } else {
      throw new Error(
        'Reconstruction with signature and recoveryID requires payeeNodeKey to verify correctness of input data.'
      );
    }
  }

  if (sigWords) {
    dataWords = buffutils.concat(dataWords, sigWords);
  }

  if (data.timestamp === undefined) {
    throw new Error('expected timestamp');
  }

  const tags6Item = tagsItems(data.tags, isDefined(TAGNAMES.get(6))) as number | undefined;
  if (tags6Item !== undefined) {
    data.timeExpireDate = data.timestamp + tags6Item;
    data.timeExpireDateString = new Date(data.timeExpireDate * 1000).toISOString();
  }
  data.timestampString = new Date(data.timestamp * 1000).toISOString();
  data.prefix = prefix;
  data.wordsTemp = bech32.encode('temp', dataWords);
  data.complete = !!sigWords;

  if (!data.complete) {
    throw new Error('can not encode incomplete');
  }
  return bech32.encode(prefix, dataWords);
}

function intBEToWords(intBE: number = 0, bits: number = 5) {
  let words = [];
  intBE = Math.floor(intBE);
  if (intBE === 0) return Uint8Array.of(0);
  while (intBE > 0) {
    words.push(intBE & (Math.pow(2, bits) - 1));
    intBE = Math.floor(intBE / Math.pow(2, bits));
  }
  return Uint8Array.from(words.reverse());
}
