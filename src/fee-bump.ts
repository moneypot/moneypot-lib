import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import * as assert from './util/assert';

import AbstractTransfer, { parseTransferData, TransferData } from './abstract-transfer';

export default class FeeBump extends AbstractTransfer {
  static fromPOD(data: any): FeeBump | Error {
    const transferData = parseTransferData(data);
    if (transferData instanceof Error) {
      throw transferData;
    }
    const txid = Buffutils.fromHex(data.txid, 32);
    if (txid instanceof Error) {
      return new Error('FeeBump.fromPOD invalid txid');
    }

    return new FeeBump(transferData, txid);
  }

  txid: Uint8Array;
  get kind(): 'FeeBump' {
    return 'FeeBump';
  }

  constructor(transferData: TransferData, txid: Uint8Array) {
    super(transferData);

    this.txid = txid;
    assert.equal(txid.length, 32);
    this.txid = txid;
  }

  toPOD(): POD.FeeBump {
    return {
      ...super.toPOD(),
      txid: Buffutils.toHex(this.txid),
    };
  }

  static hashOf(transferHash: Hash, txid: Uint8Array) {
    return Hash.fromMessage('FeeBump', transferHash.buffer, txid);
  }

  hash() {
    return FeeBump.hashOf(AbstractTransfer.transferHash(this), this.txid);
  }
}
