import Hash from './hash';
import * as POD from './pod';
import PublicKey from './public-key';
import * as Buffutils from './util/buffutils';

export default class LightningHookin {
  public amount: number;
  public creditTo: PublicKey;
  public invoice: string;

  public static fromPOD(data: any): LightningHookin | Error {
    return new Error('todo...');
  }

  constructor(amount: number, creditTo: PublicKey, invoice: string) {
    this.amount = amount;
    this.creditTo = creditTo;
    this.invoice = invoice;
  }

  public hash(): Hash {
    const builder = Hash.newBuilder('LightningHookin');
    builder.update(Buffutils.fromUint64(this.amount));
    builder.update(this.creditTo.buffer);
    builder.update(Buffutils.fromString(this.invoice));
    return builder.digest();
  }

  public toPOD(): POD.LightningHookin {
    return {
      amount: this.amount,
      creditTo: this.creditTo.toBech(),
      invoice: this.invoice,
    };
  }
}
