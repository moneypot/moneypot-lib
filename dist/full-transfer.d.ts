import Hash from './hash';
import Signature from './signature';
import * as POD from './pod';
import HSet from './hset';
import Coin from './coin';
import Bounty from './bounty';
import { Hookout } from '.';
import Transfer from './transfer';
export default class FullTransfer {
    static fromPOD(data: any): FullTransfer | Error;
    inputs: HSet<Coin, POD.Coin>;
    bounties: HSet<Bounty, POD.Bounty>;
    hookout: Hookout | undefined;
    authorization: Signature;
    constructor(inputs: HSet<Coin, POD.Coin>, bounties: HSet<Bounty, POD.Bounty>, hookout: Hookout | undefined, authorization: Signature);
    static hashOf(inputs: Hash, bounties: Hash, hookout: Hash | undefined): Hash;
    hash(): Hash;
    toPOD(): POD.FullTransfer;
    fee(): number;
    outputAmount(): number;
    isValid(): boolean;
    prune(): Transfer;
}
