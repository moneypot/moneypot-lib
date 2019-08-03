import * as Buffutils from './util/buffutils';

import * as POD from './pod';

import Hash from './hash';

import * as bolt11 from './bolt11';

import Abstract, { parseTransferData, TransferData } from './abstract-transfer';

export default class LightningPayment extends Abstract {
  public static fromPOD(data: any): LightningPayment | Error {
    const transferData = parseTransferData(data);
    if (transferData instanceof Error) {
      throw transferData;
    }

    let pro;
    try {
      pro = bolt11.decodeBolt11(data.paymentRequest);
    } catch (err) {
      console.warn('warn: bolt11 decode error: ', err);
      return err;
    }

    if (pro.satoshis && pro.satoshis !== transferData.amount) {
      return new Error('amount does not match invoice amount');
    }

    return new LightningPayment(transferData, data.paymentRequest);
  }

  paymentRequest: string;
  public get kind(): 'LightningPayment' {
    return 'LightningPayment';
  }

  constructor(transferData: TransferData, paymentRequest: string) {
    super(transferData);
    this.paymentRequest = paymentRequest;
  }

  public toPOD(): POD.LightningPayment {
    return {
      ...super.toPOD(),
      paymentRequest: this.paymentRequest,
    };
  }

  public hash() {
    const h = Hash.newBuilder('LightningPayment');

    h.update(this.transferHash().buffer);
    h.update(Buffutils.fromString(this.paymentRequest));

    return h.digest();
  }
}
