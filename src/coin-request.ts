import PublicKey from './public-key';
import BlindedMessage from './blinded-message';
import Magnitude from './magnitude';

export default interface CoinRequest {
  blindingNonce: PublicKey;
  blindedOwner: BlindedMessage;
  magnitude: Magnitude;
}
