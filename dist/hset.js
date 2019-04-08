"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./util/assert");
const hash_1 = require("./hash");
const buffutils = require("./util/buffutils");
class HSet {
    constructor(entries) {
        this.entries = entries;
        this.canonicalize();
    }
    static fromPOD(data, fromPOD) {
        if (Array.isArray(data)) {
            return new Error('HSet was expecting an array');
        }
        const entries = [];
        for (const input of data) {
            const entry = fromPOD(input);
            if (entry instanceof Error) {
                return entry;
            }
            entries.push(entry);
        }
        return new HSet(entries);
    }
    get amount() {
        let sum = 0;
        for (const entry of this.entries) {
            sum += entry.amount;
        }
        return sum;
    }
    [Symbol.iterator]() {
        return this.entries[Symbol.iterator]();
    }
    get(n) {
        assert_1.default(n >= 0);
        assert_1.default(n < this.entries.length);
        return this.entries[n];
    }
    get length() {
        return this.entries.length;
    }
    // modifies the entries
    canonicalize() {
        this.entries.sort(compare);
    }
    toPOD() {
        assert_1.default(this.isCanonicalized());
        return this.entries.map(e => e.toPOD());
    }
    hash() {
        assert_1.default(this.isCanonicalized());
        const h = hash_1.default.newBuilder('HSet');
        for (const input of this.entries) {
            h.update(input.hash().buffer);
        }
        return h.digest();
    }
    isCanonicalized() {
        for (let i = 1; i < this.entries.length; i++) {
            if (compare(this.entries[i - 1], this.entries[i]) > 0) {
                return false;
            }
        }
        return true;
    }
}
exports.default = HSet;
function compare(a, b) {
    return buffutils.compare(a.hash().buffer, b.hash().buffer);
}
//# sourceMappingURL=hset.js.map