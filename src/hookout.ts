import * as POD from './pod';
import * as Buffutils from './util/buffutils';

import Hash from './hash';
import Transfer, { TransferData, parseTransferData } from './transfer';

export type Priority = 'CUSTOM' | 'IMMEDIATE' | 'BATCH' | 'FREE';

export default class Hookout extends Transfer {
  
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

  public hash() {
    const h = Hash.newBuilder('Hookout');

    h.update(super.transferHash().buffer);

    h.update(Buffutils.fromString(this.bitcoinAddress));
    h.update(Buffutils.fromUint8(this.priority.charCodeAt(0)));

    return h.digest();
  }
}
