"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var blob_exports = {};
__export(blob_exports, {
  default: () => Blob
});
module.exports = __toCommonJS(blob_exports);
class Blob {
  buffer;
  type;
  closed;
  constructor(sources = [], options) {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Blob",
      writable: false,
      enumerable: false,
      configurable: true
    });
    this.closed = false;
    this.type = "";
    const buffers = sources.map((source) => {
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
    const type = options && options.type !== void 0 && String(options.type).toLowerCase();
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
  set isClosed(value) {
    this.closed = value;
  }
  slice(start = 0, end = this.size, type) {
    const size = this.size;
    const relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
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
  configurable: true
});
//# sourceMappingURL=blob.js.map
