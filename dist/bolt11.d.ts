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
export declare function decodeBolt11(paymentRequest: string): PaymentRequestObject;
export declare function encodeBolt11(paymentRequest: PaymentRequestObject): {
    paymentRequest?: string | undefined;
    complete?: boolean | undefined;
    prefix?: string | undefined;
    wordsTemp?: string | undefined;
    coinType?: string | undefined;
    satoshis?: number | undefined;
    millisatoshis?: bigint | undefined;
    timestamp?: number | undefined;
    timestampString?: string | undefined;
    timeExpireDate?: number | undefined;
    timeExpireDateString?: string | undefined;
    payeeNodeKey?: string | undefined;
    signature?: string | undefined;
    recoveryFlag?: number | undefined;
    tags: {
        tagName: string;
        data: TagData;
    }[];
};
export {};
