import Hash from './hash';
import * as POD from './pod';
import * as Buffutils from './util/buffutils';

export default class LightningHookout {
  public static fromPOD(data: any): LightningHookout | Error {
    return new Error('TODO...');
  }

  public invoice: string;
  public amount: number; // must be encoded in the invoice actually... but that's annoying to work with

  public constructor(invoice: string, amount: number) {
    this.invoice = invoice;
    this.amount = amount;
  }

  public hash(): Hash {
    const builder = Hash.newBuilder('LightningHookout');
    builder.update(Buffutils.fromString(this.invoice));
    return builder.digest();
  }

  public toPOD(): POD.LightningHookout {
    return {
      amount: this.amount,
      invoice: this.invoice,
    };
  }
}
