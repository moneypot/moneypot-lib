import { strictEqual, deepStrictEqual, strict } from 'assert';
import 'mocha';
import { decodeBitcoinAddress } from '../src/util/bitcoin-address';
import { decode } from '../src/util/bech32';

function isTrue(x: any) {
  strictEqual(x, true);
}
function isError(x: any) {
  isTrue(x instanceof Error);
}

describe('bitcoin address', () => {
  it('validates Mainnet P2PKH', () => {
    const addressInfo = decodeBitcoinAddress('17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem');
    deepStrictEqual(addressInfo, { kind: 'p2pkh', network: 'mainnet' });
  });

  it('validates Testnet P2PKH', () => {
    const addressInfo = decodeBitcoinAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn');
    deepStrictEqual(addressInfo, { kind: 'p2pkh', network: 'testnet' });
  });

  it('fails on invalid P2PKH', () => {
    const address = '17VZNX1SN5NtKa8UFFxwQbFeFc3iqRYhem';

    isError(decodeBitcoinAddress(address));
  });

  it('validates Mainnet P2SH', () => {
    const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2sh', network: 'mainnet' });
  });

  it('validates Testnet P2SH', () => {
    const address = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2sh', network: 'testnet' });
  });

  it('fails on invalid P2SH', () => {
    const address = '17VZNX1SN5NtKa8UFFxwQbFFFc3iqRYhem';

    isError(decodeBitcoinAddress(address));
  });

  it('handles bogus address', () => {
    const address = 'x';

    isError(decodeBitcoinAddress(address));
  });

  it('validates Mainnet Bech32 P2WPKH', () => {
    const addresses = ['bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bc1q973xrrgje6etkkn9q9azzsgpxeddats8ckvp5s'];

    deepStrictEqual(decodeBitcoinAddress(addresses[0]), { kind: 'p2wpkh', network: 'mainnet' });
    deepStrictEqual(decodeBitcoinAddress(addresses[1]), { kind: 'p2wpkh', network: 'mainnet' });
  });

  it('validates Testnet Bech32 P2WPKH', () => {
    const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2wpkh', network: 'testnet' });
  });

  it('validates Mainnet Bech32 P2WSH', () => {
    const address = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2wsh', network: 'mainnet' });
  });

  it('validates Testnet Bech32 P2WSH', () => {
    const address = 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2wsh', network: 'testnet' });
  });

  it('fails on invalid Bech32', () => {
    const address = 'bc1qw508d6qejxtdg4y5r3zrrvary0c5xw7kv8f3t4';

    isError(decodeBitcoinAddress(address));
  });

  // is this extensive enough?

  it('validates Testnet P2TR using bech32m decoding', () => {
    const address = 'tb1pvyjn32ranzv2lxs5s8q5pptfjkejw8f3t950afs9v6ehwaanhk2q9atrhz';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2tr', network: 'testnet' });
  });

  it('validates Mainnet P2TR using bech32m decoding', () => {
    const address = 'bc1pvyjn32ranzv2lxs5s8q5pptfjkejw8f3t950afs9v6ehwaanhk2qj4avdd';

    deepStrictEqual(decodeBitcoinAddress(address), { kind: 'p2tr', network: 'mainnet' });
  });

  it('fails on mainnet addresses with witness version 1 encoded using bech32', () => {
    const address = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqh2y7hd';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on testnet addresses with witness version 1 encoded using bech32', () => {
    const address = 'tb1z0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqglt7rf';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on mainnet addresses with witness version 0 encoded using bech32m', () => {
    const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kemeawh';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on testnet addresses with witness version 0 encoded using bech32m', () => {
    const address = 'tb1q0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vq24jc47';

    isError(decodeBitcoinAddress(address));
  });

  // some more generic errors detailed in the bip
  it('fails when invalid character in checksum ', () => {
    const address = 'bc1p38j9r5y49hruaue7wxjce0updqjuyyx0kh56v8s25huc6995vvpql3jow4';

    isError(decodeBitcoinAddress(address));
  });

  it('fails when invalid witness ', () => {
    const address = 'BC130XLXVLHEMJA6C4DQV22UAPCTQUPFHLXM9H8Z3K2E72Q4K9HCZ7VQ7ZWS8R';

    isError(decodeBitcoinAddress(address));
  });

  it('fails when invalid program length (1 byte) ', () => {
    const address = 'bc1pw5dgrnzv';

    isError(decodeBitcoinAddress(address));
  });

  it('fails when invalid program length (41 bytes) ', () => {
    const address = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7v8n0nx0muaewav253zgeav';

    isError(decodeBitcoinAddress(address));
  });

  it('fails when Invalid program length for witness version 0 (per BIP141) ', () => {
    const address = 'BC1QR508D6QEJXTDG4Y5R3ZARVARYV98GJ9P';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on mixed case ', () => {
    const address = 'tb1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vq47Zagq';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on zero padding of more than 4 bits ', () => {
    const address = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7v07qwwzcrf';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on Non-zero padding in 8-to-5 conversion', () => {
    const address = 'tb1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vpggkg4j';

    isError(decodeBitcoinAddress(address));
  });

  it('fails on Empty data section', () => {
    const address = 'bc1gmk9yu';

    isError(decodeBitcoinAddress(address));
  });
});
