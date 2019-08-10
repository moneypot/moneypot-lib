"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const buffutils_1 = require("./util/buffutils");
// NOTE: these statuses are unstructured, and unvalidated.
class Status {
    constructor(s) {
        this.s = s;
    }
    toPOD() {
        return this.s;
    }
    hash() {
        const str = this.stringify();
        console.log('debug: stringified status: ', str);
        return hash_1.default.fromMessage('Status', buffutils_1.fromString(str));
    }
    stringify() {
        return JSON.stringify(this.s, (key, value) => {
            if (typeof value === 'object') {
                // if (typeof value.toPOD === 'function') {
                //   return value.toPOD();
                // }
                let newObj = {};
                for (const k of Object.keys(value).sort()) {
                    newObj[k] = value[k];
                }
                return newObj;
            }
            return value;
        });
    }
}
exports.default = Status;
//# sourceMappingURL=status.js.map