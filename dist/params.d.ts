import PrivateKey from './private-key';
import PublicKey from './public-key';
declare const t: {
    acknowledgementPrivateKey: PrivateKey;
    acknowledgementPublicKey: PublicKey;
    basicTransferFee: number;
    blindingCoinPrivateKeys: PrivateKey[];
    blindingCoinPublicKeys: PublicKey[];
    fundingPrivateKey: PrivateKey;
    fundingPublicKey: PublicKey;
    templateTransactionWeight: number;
    transactionConsolidationFee: number;
};
export default t;
