import PrivateKey from './private-key';
import PublicKey from './public-key';
import * as buffutils from './util/buffutils';

// obviously for dev only...
const masterPriv = PrivateKey.fromBech('privhi1gqfkvnju6n9qqmz4hgvq3dd8rg5lgl72tmz63pjxay3wm4rz39eqy2jtly');
if (masterPriv instanceof Error) {
  throw masterPriv;
}

const fundingPriv = masterPriv.derive(buffutils.fromUint8(0));
const ackPrivkey = masterPriv.derive(buffutils.fromUint8(1));
const blindPriv = masterPriv.derive(buffutils.fromUint8(2));

const param = {
  acknowledgementPrivateKey: ackPrivkey, //  wont be exposed for prodnet ... ;D
  acknowledgementPublicKey: ackPrivkey.toPublicKey(),
  basicTransferFee: 200, // satoshi...
  blindingCoinPrivateKeys: new Array<PrivateKey>(31), // array of 0 to 30 (inclusive) -- dev obviously
  blindingCoinPublicKeys: new Array<PublicKey>(31),
  fundingPrivateKey: fundingPriv, //  wont be exposed for prodnet ... ;D
  fundingPublicKey: fundingPriv.toPublicKey(),
  templateTransactionWeight: 1000, // the fake-size of a transfer when making a withdrawal
  transactionConsolidationFee: 5000,
};

for (let i = 0; i < 31; i++) {
  param.blindingCoinPrivateKeys[i] = blindPriv.derive(buffutils.fromUint8(i));
  param.blindingCoinPublicKeys[i] = param.blindingCoinPrivateKeys[i].toPublicKey();
}

export default param;
