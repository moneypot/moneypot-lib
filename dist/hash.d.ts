export default class Hash {
    static fromMessage(prefix: string, ...message: Uint8Array[]): Promise<Hash>;
    static newBuilder(prefix: string): {
        update(message: Uint8Array): void;
        digest(): Promise<Hash>;
    };
    static fromBech(serialized: string): Hash | Error;
    buffer: Uint8Array;
    constructor(buff: Uint8Array);
    toBech(): string;
}
