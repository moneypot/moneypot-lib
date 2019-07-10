import Hash from './hash';
export default class LightningInvoice {
    paymentReq: PaymentRequestObject;
    static fromPOD(data: string): LightningInvoice | Error;
    constructor(paymentReq: PaymentRequestObject);
    hash(): Hash;
    toPOD(): string;
}
declare type RoutingInfo = Array<{
    pubkey: string;
    short_channel_id: string;
    fee_base_msat: number;
    fee_proportional_millionths: number;
    cltv_expiry_delta: number;
}>;
declare type FallbackAddress = {
    code: number;
    address: string;
    addressHash: string;
};
export declare type TagData = string | number | RoutingInfo | FallbackAddress;
export declare type PaymentRequestObject = {
    paymentRequest?: string;
    complete?: boolean;
    prefix?: string;
    wordsTemp?: string;
    coinType?: string;
    satoshis?: number;
    millisatoshis?: bigint;
    timestamp?: number;
    timestampString?: string;
    timeExpireDate?: number;
    timeExpireDateString?: string;
    payeeNodeKey?: string;
    signature?: string;
    recoveryFlag?: number;
    tags: Array<{
        tagName: string;
        data: TagData;
    }>;
};
export {};
