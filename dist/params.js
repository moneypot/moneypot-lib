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
const param = {
    acknowledgementPrivateKey: ackPrivkey,
    acknowledgementPublicKey: ackPrivkey.toPublicKey(),
    basicTransferFee: 200,
    blindingCoinPrivateKeys: new Array(31),
    blindingCoinPublicKeys: new Array(31),
    fundingPrivateKey: fundingPriv,
    fundingPublicKey: fundingPriv.toPublicKey(),
    templateTransactionWeight: 1000,
    transactionConsolidationFee: 5000,
};
for (let i = 0; i < 31; i++) {
    param.blindingCoinPrivateKeys[i] = blindPriv.derive(buffutils.fromUint8(i));
    param.blindingCoinPublicKeys[i] = param.blindingCoinPrivateKeys[i].toPublicKey();
}
exports.default = param;
//# sourceMappingURL=params.js.map