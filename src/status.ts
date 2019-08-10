import * as POD from './pod';
import Hash from './hash';
import { fromString } from './util/buffutils';

// NOTE: these statuses are unstructured, and unvalidated.
export default class Status {
  s: POD.Status

  constructor(s: POD.Status) {
    this.s = s;
  }

  toPOD() {
    return this.s;
  }

  hash() {
    const str = this.stringify();
    console.log('debug: stringified status: ', str);
    return Hash.fromMessage('Status', fromString(str));
  }

  private stringify() {
    return JSON.stringify(this.s, (key, value) => {
  
      if (typeof value === 'object') {
        // if (typeof value.toPOD === 'function') {
        //   return value.toPOD();
        // }

        let newObj: any = {};
        for (const k of Object.keys(value).sort()) {
          newObj[k] = value[k];
        }
        return newObj;
      }
      return value;
    });
  }

}


