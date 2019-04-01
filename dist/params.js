"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const private_key_1 = require("./private-key");
const buffutils = require("./util/buffutils");
// obviously for dev only...
const masterPriv = private_key_1.default.fromBech('privhi1gqfkvnju6n9qqmz4hgvq3dd8rg5lgl72tmz63pjxay3wm4rz39eqy2jtly');
if (masterPriv instanceof Error) {
    throw masterPriv;
}
const fundingPriv = masterPriv.derive(buffutils.fromUint8(0));
const ackPrivkey = masterPriv.derive(buffutils.fromUint8(1));
const blindPriv = masterPriv.derive(buffutils.fromUint8(2));
const t = {
    acknowledgementPrivateKey: ackPrivkey,
    acknowledgementPublicKey: ackPrivkey.toPublicKey(),
    basicTransferFee: 200,
    blindingCoinPrivateKeys: new Array(31),
    blindingCoinPublicKeys: new Array(31),
    fundingPrivateKey: fundingPriv,
    fundingPublicKey: fundingPriv.toPublicKey(),
    templateTransactionWeight: 561,
    transactionConsolidationFee: 5000,
};
// tx sizes..
// i = 271
// c = 48
// o = 121
for (let i = 0; i < 31; i++) {
    t.blindingCoinPrivateKeys[i] = blindPriv.derive(buffutils.fromUint8(i));
    t.blindingCoinPublicKeys[i] = t.blindingCoinPrivateKeys[i].toPublicKey();
}
exports.default = t;
//
//
// let param: any = {};
//
//
// function toJson(x: any) {
//   if (typeof x === 'string') {
//     return x;
//   }
//   if (typeof x === 'number') {
//     return x.toString();
//   }
//
//   if (typeof x === 'bigint') {
//     return x.toString();
//   }
//
//   if (Array.isArray(x)) {
//     let buf = '[\n';
//
//     for (const k of x) {
//       buf += '\t' + toJson(k) + ', \n';
//     }
//
//     buf += ']';
//     return buf;
//   }
//
//   if (typeof x === 'object') {
//       if (x instanceof PrivateKey) {
//         return `notError( PrivateKey.fromBech("${ x.toBech() }") )`;
//       }
//       if (x instanceof PublicKey) {
//         return `notError( PublicKey.fromBech("${ x.toBech() }") )`;
//       }
//
//
//     let buf = '{\n';
//
//     for (const k of Object.keys(x)) {
//       const v = x[k];
//       buf += k + ': ' + toJson(v) + ',\n';
//     }
//
//     buf += '}\n';
//     return buf;
//   }
//
//
//   throw new Error('unknown x: ' + x.toString());
//
// }
//# sourceMappingURL=params.js.map