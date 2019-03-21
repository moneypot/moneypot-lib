import * as POD from './pod';

export default class Magnitude {
  static MaxMagnitude = 30;

  static fromPOD(d: any): Error | Magnitude {
    if (!Number.isSafeInteger(d) || d < 0 || d > 30) {
      return new Error('magnitude expected an integer between 0 and 0');
    }
    return new Magnitude(d);
  }

  readonly n: number;
  constructor(n: number) {
    if (n < 0 || n > 30 || !Number.isInteger(n)) {
      throw new Error('assertion: magnitude must be between 0 and 30');
    }
    this.n = n;
  }

  toAmount(): number {
    return 2 ** this.n;
  }

  get buffer(): Uint8Array {
    return Uint8Array.of(this.n);
  }

  toPOD(): POD.Magnitude {
    return this.n;
  }
}
