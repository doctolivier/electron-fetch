import { BlobOptions } from "node:buffer";
import { BinaryLike } from "node:crypto";
export default class Blob {
    buffer: Buffer;
    readonly type: string;
    private closed;
    constructor(sources?: Array<ArrayBuffer | BinaryLike | Blob>, options?: BlobOptions);
    get size(): number;
    get isClosed(): boolean;
    set isClosed(value: boolean);
    slice(start?: number, end?: number, type?: string): Blob;
    close(): void;
}
