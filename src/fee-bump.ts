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
    const confTarget = data.confTarget
    if (typeof confTarget !== 'number') { 
      return new Error('Feebump.frompod invalid conftarget')
    }
    return new FeeBump(transferData, txid, confTarget);
  }

  txid: Uint8Array;
  confTarget: number;
  get kind(): 'FeeBump' {
    return 'FeeBump';
  }

  constructor(transferData: TransferData, txid: Uint8Array, confTarget: number) {
    super(transferData);

    this.txid = txid;
    assert.equal(txid.length, 32);
    this.txid = txid;
    this.confTarget = confTarget
  }

  toPOD(): POD.FeeBump {
    return {
      ...super.toPOD(),
      txid: Buffutils.toHex(this.txid),
      confTarget: this.confTarget
    };
  }

  static hashOf(transferHash: Hash, txid: Uint8Array, confTarget: number) {
    return Hash.fromMessage('FeeBump', transferHash.buffer, txid, Buffutils.fromUint64(confTarget));
  }

  hash() {
    return FeeBump.hashOf(AbstractTransfer.transferHash(this), this.txid, this.confTarget);
  }
}
