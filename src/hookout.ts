import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import AbstractTransfer, { TransferData, parseTransferData } from './abstract-transfer';

export type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';

export default class Hookout extends AbstractTransfer {
  public static fromPOD(data: any): Hookout | Error {
    const transferData = parseTransferData(data);
    if (transferData instanceof Error) {
      return transferData;
    }

    const bitcoinAddress = data.bitcoinAddress;
    if (typeof bitcoinAddress !== 'string') {
      return new Error('Hookout.fromPOD invalid bitcoin address');
    }

    const priority = data.priority;
    if (['CUSTOM', 'IMMEDIATE', 'BATCH', 'FREE'].indexOf(priority) === -1) {
      return new Error('Unrecognized priority');
    }

    return new Hookout(transferData, bitcoinAddress, priority);
  }

  public bitcoinAddress: string;
  public priority: Priority;
  public get kind(): 'Hookout' {
    return 'Hookout';
  }

  constructor(td: TransferData, bitcoinAddress: string, priority: Priority) {
    super(td);
    this.bitcoinAddress = bitcoinAddress;
    this.priority = priority;
  }

  public toPOD(): POD.Hookout {
    return {
      ...super.toPOD(),
      bitcoinAddress: this.bitcoinAddress,
      priority: this.priority,
    };
  }

  static hashOf(transferDataHash: Hash, bitcoinAddress: string, priority: Priority) {
    return Hash.fromMessage('Hookout',
      transferDataHash.buffer,
      Buffutils.fromString(bitcoinAddress),
      Buffutils.fromString(priority[0]), // first letter must be unique
    )
  }

  public hash() {
    return Hookout.hashOf(
      AbstractTransfer.transferHash(this),
      this.bitcoinAddress,
      this.priority
    );
  }
}
