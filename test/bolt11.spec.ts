import { strictEqual } from 'assert';
import 'mocha';

import * as bolt11 from '../src/bolt11';

describe('LightningInvoice', () => {
  it('should decode', () => {
    const paymentRequest =
      'lnbc20m1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqhp58yjmdan79s6qqdhdzgynm4zwqd5d7xmw5fk98klysy043l2ahrqscc6gd6ql3jrc5yzme8v4ntcewwz5cnw92tz0pc8qcuufvq7khhr8wpald05e92xw006sq94mg8v2ndf4sefvf9sygkshp5zfem29trqq2yxxz7';

    const res = bolt11.decodeBolt11(paymentRequest);
    if (res instanceof Error) {
      throw res;
    }

    strictEqual(res.complete, true);
    strictEqual(res.satoshis, 2000000);
    strictEqual(
      res.signature,
      'c63486e81f8c878a105bc9d959af1973854c4dc552c4f0e0e0c7389603d6bdc67707bf6be992a8ce7bf50016bb41d8a9b5358652c4960445a170d049ced4558c'
    );
    strictEqual(res.recoveryFlag, 0);
    strictEqual(res.payeeNodeKey, '03e7156ae33b0a208d0744199163177e909e80176e55d97a2f221ede0f934dd9ad');

    const pr = bolt11.encodeBolt11(res);
    strictEqual(pr, paymentRequest);
  });

  it('work with gend invoice', () => {
    const obj = {
      coinType: 'testnet',
      complete: true,
      millisatoshis: BigInt(300000000),
      payeeNodeKey: '03c856d2dbec7454c48f311031f06bb99e3ca1ab15a9b9b35de14e139aa663b463',
      prefix: 'lntb3m',
      recoveryFlag: 1,
      satoshis: 300000,
      signature:
        'b5c5d56b4430c7070977ebd679b9a33118705d75b6d4ebcef4fcefcfecb0dc5b3986f202bc10ff4ffdcc22fd9321ff80b0245e0795a10c9da2a20b83807b5028',
      tags: [
        { tagName: 'payment_hash', data: '129bc32c259c505b6f84083e2b05cabdf537a210c1d2ec2c731702ed441ab3cb' },
        { tagName: 'description', data: '' },
        { tagName: 'min_final_cltv_expiry', data: 40 },
        { tagName: 'expire_time', data: 86400 },
      ],
      timeExpireDate: 1563233355,
      timeExpireDateString: '2019-07-15T23:29:15.000Z',
      timestamp: 1563146955,
      timestampString: '2019-07-14T23:29:15.000Z',
      wordsTemp:
        'temp1pwjhwktpp5z2duxtp9n3g9kmuypqlzkpw2hh6n0gssc8fwctrnzupw63q6k09sdqqcqzpgxqyz5vqkhza266yxrrswztha0t8nwdrxyv8qht4km2whnh5lnhulm9sm3dnnphjq27ppl60lhxz9lvny8lcpvpytcretggvnk32yzurspa4q2qpmtcehy',
    };

    const res = bolt11.encodeBolt11(obj);

    console.log('encoded object: ', res);
  });
});
