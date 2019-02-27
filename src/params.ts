import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as buffutils from './util/buffutils';


let param: any = {};

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
    acknowledgementPrivateKey: ackPrivkey, //  wont be exposed for prodnet ... ;D
    acknowledgementPublicKey: await ackPrivkey.toPublicKey(),
    basicTransferFee: 200, // satoshi...
    blindingCoinPrivateKeys: new Array<PrivateKey>(31), // array of 0 to 30 (inclusive) -- dev obviously
    blindingCoinPublicKeys: new Array<PublicKey>(31),
    fundingPrivateKey: fundingPriv, //  wont be exposed for prodnet ... ;D
    fundingPublicKey: await fundingPriv.toPublicKey(),
    templateTransactionWeight: 1000, // the fake-size of a transfer when making a withdrawal
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
