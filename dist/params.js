import PrivateKey from './private-key';
import * as buffutils from './util/buffutils';
let param = {};
async function c() {
    // obviously for dev only...
    const masterPriv = PrivateKey.fromBech('privhi1gqfkvnju6n9qqmz4hgvq3dd8rg5lgl72tmz63pjxay3wm4rz39eqy2jtly');
    if (masterPriv instanceof Error) {
        throw masterPriv;
    }
    const fundingPriv = await masterPriv.derive(buffutils.fromUint8(0));
    const ackPrivkey = await masterPriv.derive(buffutils.fromUint8(1));
    const blindPriv = await masterPriv.derive(buffutils.fromUint8(2));
    const t = {
        acknowledgementPrivateKey: ackPrivkey,
        acknowledgementPublicKey: await ackPrivkey.toPublicKey(),
        basicTransferFee: 200,
        blindingCoinPrivateKeys: new Array(31),
        blindingCoinPublicKeys: new Array(31),
        fundingPrivateKey: fundingPriv,
        fundingPublicKey: await fundingPriv.toPublicKey(),
        templateTransactionWeight: 1000,
        transactionConsolidationFee: 5000,
    };
    for (let i = 0; i < 31; i++) {
        t.blindingCoinPrivateKeys[i] = await blindPriv.derive(buffutils.fromUint8(i));
        t.blindingCoinPublicKeys[i] = await t.blindingCoinPrivateKeys[i].toPublicKey();
    }
    console.log('initalized param as: ', t);
    param = t;
}
c();
export default param;
//# sourceMappingURL=params.js.map