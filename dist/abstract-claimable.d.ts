import Hash from './hash';
import Signature from './signature';
import PublicKey from './public-key';
export default interface AbstractClaimable {
    amount: number;
    claimant: PublicKey;
    fee: number;
    authorization?: Signature;
    kind: 'LightningPayment' | 'FeeBump' | 'Hookout' | 'LightningInvoice' | 'Hookin';
    hash(): Hash;
}
