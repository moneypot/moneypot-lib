import * as buffutils from './buffutils';
import * as bech32 from './bech32';
import * as bs58check from './bs58check';

export function toBase58Check(hash: Uint8Array, version: number) {
  const payload = new Uint8Array(21);

  payload[0] = version;
  buffutils.copy(hash, payload, 1);

  return bs58check.encode(payload);
}

export function toBech32(data: Uint8Array, version: number, prefix: string): string {
  const words = buffutils.concat(buffutils.fromUint8(version), bech32.toWords(data));

  return bech32.encode(prefix, words);
}

type AddressKind = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr';

export function decodeBitcoinAddress(address: string): { kind: AddressKind; network: 'mainnet' | 'testnet' } | Error {
  if (address.startsWith('bc1') || address.startsWith('tb1')) {
    let decoded;
    try {
      decoded = bech32.decode(address);
    } catch (err) {
      return new Error('invalid bech32 encoding for address');
    }

    let network: 'mainnet' | 'testnet';
    if (decoded.prefix === 'bc') {
      network = 'mainnet';
    } else if (decoded.prefix == 'tb') {
      network = 'testnet';
    } else {
      return new Error('unknown bech32 prefix');
    }

    const witnessVersion = decoded.words[0];

    // do not support v2-16 until we need to
    if ([0, 1].indexOf(witnessVersion) < 0) {
      return new Error('unknown witness version');
    }

    const data = bech32.fromWords(decoded.words.slice(1));

    // can we do it like this?
    if (data.length === 20 && witnessVersion === 0 && decoded.chk === 1) {
      return { kind: 'p2wpkh', network };
    } else if (data.length === 32 && witnessVersion === 0 && decoded.chk === 1) {
      return { kind: 'p2wsh', network };
    } else if (witnessVersion === 1 && data.length === 32 && decoded.chk === 0x2bc830a3) {
      //v1 checksum, also check witness to pass v1 v0 mixups
      return { kind: 'p2tr', network };
    } else {
      return new Error('invalid length for bech32 address'); // generic error but could be number of things
    }
  }

  // must be a bas58 address
  let decoded;
  try {
    decoded = bs58check.decode(address);
  } catch (err) {
    return new Error('invalid base58 address');
  }

  if (decoded.length !== 21) {
    return new Error('base58 address of unexpected length');
  }

  switch (decoded[0]) {
    case 0x0:
      return { kind: 'p2pkh', network: 'mainnet' };
    case 0x6f:
      return {
        kind: 'p2pkh',
        network: 'testnet',
      };
    case 0x05:
      return {
        kind: 'p2sh',
        network: 'mainnet',
      };
    case 0xc4:
      return {
        kind: 'p2sh',
        network: 'testnet',
      };
    default:
      return new Error('unknown base58 address prefix');
  }
}
