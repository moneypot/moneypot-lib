import { strictEqual } from 'assert';
import 'mocha';

import * as LightningInvoice from '../src/lightning-invoice';

describe('LightningInvoice', () => {
  it('should decode', () => {

    const paymentRequest = 'lnbc20m1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqhp58yjmdan79s6qqdhdzgynm4zwqd5d7xmw5fk98klysy043l2ahrqscc6gd6ql3jrc5yzme8v4ntcewwz5cnw92tz0pc8qcuufvq7khhr8wpald05e92xw006sq94mg8v2ndf4sefvf9sygkshp5zfem29trqq2yxxz7';

    const res = LightningInvoice.decode(paymentRequest);

    strictEqual(res.complete, true);
    strictEqual(res.satoshis, 2000000);
    strictEqual(res.signature, 'c63486e81f8c878a105bc9d959af1973854c4dc552c4f0e0e0c7389603d6bdc67707bf6be992a8ce7bf50016bb41d8a9b5358652c4960445a170d049ced4558c');
    strictEqual(res.recoveryFlag, 0);
    strictEqual(res.payeeNodeKey, '03e7156ae33b0a208d0744199163177e909e80176e55d97a2f221ede0f934dd9ad');

    
  });

 
});
