import assert from './util/assert';

import Hash from './hash';

import * as buffutils from './util/buffutils';


type Settable<P> = { hash: () => Hash, amount: number, toPOD: () => P }

export default class HSet<T extends Settable<P>, P> {

  public static fromPOD<T extends Settable<P>, P>(data: any, fromPOD: (d: any) => T|Error): HSet<T, P> | Error {

    if (Array.isArray(data)) {
      return new Error('HSet was expecting an array');
    }

    const entries: T[] = [];

    for (const input of data) {
      const entry = fromPOD(input);
      if (entry instanceof Error) {
        return entry;
      }
      entries.push(entry);
    }

    return new HSet<T,P>(entries);
  }

  public readonly entries: T[];

  constructor(entries: T[]) {
    this.entries = entries;

    this.canonicalize();
  }

  public get amount() {
    let sum = 0;
    for (const entry of this.entries) {
      sum += entry.amount;
    }
    return sum;
  }

  public [Symbol.iterator]() {
    return this.entries[Symbol.iterator]();
  }

  public get(n: number): T {
    assert(n >= 0);
    assert(n < this.entries.length);

    return this.entries[n];
  }

  public get length() {
    return this.entries.length;
  }

  // modifies the entries
  private canonicalize() {
    this.entries.sort(compare);
  }


  public toPOD(): P[] {
    assert(this.isCanonicalized());

    return this.entries.map(e => e.toPOD());
  }

  public hash() {
    assert(this.isCanonicalized());

    const h = Hash.newBuilder('HSet');

    for (const input of this.entries) {
      h.update(input.hash().buffer);
    }

    return h.digest();
  }

  private isCanonicalized() {
    for (let i = 1; i < this.entries.length; i++) {
      if (compare(this.entries[i - 1], this.entries[i]) > 0) {
        return false;
      }
    }

    return true;
  }

}

function compare<T extends { hash(): Hash }>(a: T, b: T): number {
  return buffutils.compare(a.hash().buffer, b.hash().buffer);
}
