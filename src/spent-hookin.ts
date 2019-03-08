import Signature from './signature';
import Hookin from './hookin';
import * as POD from './pod';

export default class SpentHookin {
  static fromPOD(data: any): SpentHookin | Error {
    const spendAuthorization = Signature.fromBech(data.spendAuthorization);
    if (spendAuthorization instanceof Error) {
      return spendAuthorization;
    }

    const hookin = Hookin.fromPOD(data);
    if (hookin instanceof Error) {
      return hookin;
    }

    return new SpentHookin(hookin, spendAuthorization);
  }

  public hookin: Hookin;
  public spendAuthorization: Signature;

  constructor(hookin: Hookin, spendAuthorization: Signature) {
    this.hookin = hookin;
    this.spendAuthorization = spendAuthorization;
  }

  public get amount(): number {
    return this.hookin.amount;
  }

  public hash() {
    return this.hookin.hash();
  }

  public toPOD(): POD.SpentHookin {
    return {
      ...this.hookin.toPOD(),
      spendAuthorization: this.spendAuthorization.toBech(),
    };
  }
}
