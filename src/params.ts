import PrivateKey from './private-key';
import PublicKey from './public-key';

import * as buffutils from './util/buffutils';

// obviously for dev only...

const masterPriv = PrivateKey.fromPOD('privhi1gqfkvnju6n9qqmz4hgvq3dd8rg5lgl72tmz63pjxay3wm4rz39eqy2jtly');
if (masterPriv instanceof Error) {
  throw masterPriv;
}

const fundingPriv = masterPriv.derive(buffutils.fromUint8(0));
const ackPrivkey = masterPriv.derive(buffutils.fromUint8(1));
const blindPriv = masterPriv.derive(buffutils.fromUint8(2));

const t = {
  acknowledgementPrivateKey: ackPrivkey, //  wont be exposed for prodnet ... ;D
  acknowledgementPublicKey: ackPrivkey.toPublicKey(),
  basicTransferFee: 200, // satoshi...
  blindingCoinPrivateKeys: new Array<PrivateKey>(31), // array of 0 to 30 (inclusive) -- dev obviously
  blindingCoinPublicKeys: new Array<PublicKey>(31),
  fundingPrivateKey: fundingPriv, //  wont be exposed for prodnet ... ;D
  fundingPublicKey: fundingPriv.toPublicKey(),
  templateTransactionWeight: 561, // the fake-size of a transfer when making a withdrawal
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

export default t;

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
//         return `notError( PrivateKey.fromPOD("${ x.toPOD() }") )`;
//       }
//       if (x instanceof PublicKey) {
//         return `notError( PublicKey.fromPOD("${ x.toPOD() }") )`;
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
