import * as Buffutils from './util/buffutils';

import * as POD from './pod';

import Hash from './hash';

import * as bolt11 from './bolt11';

import AbstractTransfer, { parseTransferData, TransferData } from './abstract-transfer';

export default class LightningPayment extends AbstractTransfer {
  public static fromPOD(data: any): LightningPayment | Error {
    const transferData = parseTransferData(data);
    if (transferData instanceof Error) {
      return transferData;
    }

    try {
      return new LightningPayment(transferData, data.paymentRequest);
    } catch (err) {
      return new Error(err);
    }
  }

  paymentRequest: string;
  public get kind(): 'LightningPayment' {
    return 'LightningPayment';
  }

  constructor(transferData: TransferData, paymentRequest: string) {
    super(transferData);
    this.paymentRequest = paymentRequest;

    let pro = bolt11.decodeBolt11(paymentRequest);

    if (pro instanceof Error) {
      throw 'invalid bolt11 invoice: ' + pro.message;
    }

    if (pro.satoshis && pro.satoshis !== transferData.amount) {
      throw 'amount does not match invoice amount';
    }
  }

  public toPOD(): POD.LightningPayment {
    return {
      ...super.toPOD(),
      paymentRequest: this.paymentRequest,
    };
  }

  static hashOf(transferDataHash: Hash, paymentRequest: string) {
    return Hash.fromMessage('LightningPayment', transferDataHash.buffer, Buffutils.fromString(paymentRequest));
  }

  hash() {
    return LightningPayment.hashOf(AbstractTransfer.transferHash(this), this.paymentRequest);
  }
}
