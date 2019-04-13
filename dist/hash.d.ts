export default class Hash {
    static fromMessage(prefix: string, ...message: Uint8Array[]): Hash;
    static newBuilder(prefix: string): {
        update(message: Uint8Array): void;
        digest(): Hash;
    };
    static fromPOD(data: any): Hash | Error;
    buffer: Uint8Array;
    constructor(buff: Uint8Array);
    toPOD(): string;
}
