import Hash from './hash';
import PublicKey from './public-key';
export default interface AbstractClaimable {
    amount: number;
    claimant: PublicKey;
    fee: number;
    kind: 'LightningPayment' | 'FeeBump' | 'Hookout' | 'LightningInvoice' | 'Hookin';
    hash(): Hash;
}
