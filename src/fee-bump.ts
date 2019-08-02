import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import * as assert from './util/assert';

import Abstract, { parseTransferData, TransferData } from './abstract-transfer'

export default class FeeBump extends Abstract {


  public static fromPOD(data: any): FeeBump | Error {

    const transferData = parseTransferData(data);
    if (transferData instanceof Error) {
      throw transferData;
    }

    const txid = Buffutils.fromHex(data.txid, 32);
    if (typeof txid !== 'string') {
      return new Error('FeeBump.fromPOD invalid txid');
    }

    return new FeeBump(transferData, txid);
  }

  public txid: Uint8Array;
  public get kind(): 'FeeBump' { return 'FeeBump' };

  constructor(transferData: TransferData, txid: Uint8Array) {
    super(transferData);

    this.txid = txid;
    assert.equal(txid.length, 32);
    this.txid = txid;

  }

  public toPOD(): POD.FeeBump {
    return {
      ...super.transferPOD(),
      txid: Buffutils.toHex(this.txid),
      kind: 'FeeBump'
    };
  }

  public hash() {
    return Hash.fromMessage('FeeBump',
      super.transferHash().buffer,
      this.txid);
  }
}
