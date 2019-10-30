import { strictEqual, deepStrictEqual, strict } from 'assert';
import 'mocha';
import { decodeBitcoinAddress } from '../src/util/bitcoin-address';

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
});
