import { BlobOptions } from "node:buffer";
import { BinaryLike } from "node:crypto";

export default class Blob {
  public buffer: Buffer;
  readonly type: string;
  private closed: boolean;

  constructor(
    sources: Array<ArrayBuffer | BinaryLike | Blob> = [],
    options?: BlobOptions
  ) {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Blob",
      writable: false,
      enumerable: false,
      configurable: true,
    });

    this.closed = false;
    this.type = "";

    const buffers: Buffer[] = sources.map((source) => {
      if (Buffer.isBuffer(source)) {
        return source;
      } else if (ArrayBuffer.isView(source)) {
        return Buffer.from(source.buffer, source.byteOffset, source.byteLength);
      } else if (source instanceof ArrayBuffer) {
        return Buffer.from(source);
      } else if (source instanceof Blob) {
        return source.buffer;
      } else {
        return Buffer.from(String(source));
      }
    });

    this.buffer = Buffer.concat(buffers);

    const type =
      options &&
      options.type !== undefined &&
      String(options.type).toLowerCase();
    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this.type = type;
    }
  }

  get size() {
    return this.closed ? 0 : this.buffer.length;
  }

  get isClosed() {
    return this.closed;
  }

  set isClosed(value: boolean) {
    this.closed = value;
  }

  slice(start: number = 0, end: number = this.size, type?: string): Blob {
    const size = this.size;

    const relativeStart =
      start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    const relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);

    const slicedBuffer = this.buffer.subarray(
      relativeStart,
      relativeStart + span
    );
    const blob = new Blob([], { type });
    blob.buffer = slicedBuffer;
    blob.isClosed = this.closed;
    return blob;
  }

  close() {
    this.closed = true;
  }
}

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: "BlobPrototype",
  writable: false,
  enumerable: false,
  configurable: true,
});
