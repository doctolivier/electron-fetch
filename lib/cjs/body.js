"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var body_exports = {};
__export(body_exports, {
  default: () => Body
});
module.exports = __toCommonJS(body_exports);
var import_node_stream = __toESM(require("node:stream"), 1);
var import_types = require("./types.js");
var import_common = require("./common.js");
var import_blob = __toESM(require("./blob.js"), 1);
var import_fetch_error = __toESM(require("./fetch-error.js"), 1);
class Body {
  body;
  disturbed;
  size;
  timeout;
  headers;
  _url;
  get url() {
    return this._url;
  }
  set url(value) {
    this._url = value;
  }
  constructor(body, init = {}) {
    if (body == null || body === void 0) {
      body = null;
    } else if (typeof body === "string") {
    } else if (body instanceof import_blob.default) {
    } else if (Buffer.isBuffer(body)) {
    } else if (body instanceof import_node_stream.default) {
    } else {
      body = String(body);
    }
    this.body = body;
    this.disturbed = false;
    this.size = init.size || 0;
    this.timeout = init.timeout || 0;
  }
  get bodyUsed() {
    return this.disturbed;
  }
  /**
   * Decode response as ArrayBuffer
   *
   * @return {Promise}
   */
  arrayBuffer() {
    return this.consumeBody().then(
      (buf) => buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength
      )
    );
  }
  /**
   * Return raw response as Blob
   *
   * @return {Promise}
   */
  blob() {
    const ct = this.headers && this.headers.get("content-type") || "";
    return this.consumeBody().then(
      (buf) => Object.assign(
        // Prevent copying
        new import_blob.default([], {
          type: ct.toLowerCase()
        }),
        {
          buffer: buf
        }
      )
    );
  }
  /**
   * Decode response as json
   *
   * @return {Promise}
   */
  json() {
    return this.consumeBody().then(
      (buffer) => JSON.parse(buffer.toString())
    );
  }
  /**
   * Decode response as text
   *
   * @return {Promise}
   */
  text() {
    return this.consumeBody().then((buffer) => buffer.toString());
  }
  /**
   * Decode response as buffer (non-spec api)
   *
   * @return {Promise}
   */
  buffer() {
    return this.consumeBody();
  }
  /**
   * Decode response as text, while automatically detecting the encoding and
   * trying to decode to UTF-8 (non-spec api)
   *
   * @return {Promise}
   */
  textConverted() {
    return this.consumeBody().then(
      (buffer) => convertBody(buffer, this.headers || {})
    );
  }
  /**
   * Decode buffers into utf-8 string
   *
   * @return {Promise}
   */
  consumeBody() {
    if (this.disturbed) {
      return Promise.reject(new Error(`body used already for: ${this.url}`));
    }
    this.disturbed = true;
    if (this.body === null) {
      return Promise.resolve(Buffer.alloc(0));
    }
    if (typeof this.body === "string") {
      return Promise.resolve(Buffer.from(this.body));
    }
    if (this.body instanceof import_blob.default) {
      return Promise.resolve(this.body.buffer);
    }
    if (Buffer.isBuffer(this.body)) {
      return Promise.resolve(this.body);
    }
    if (!(this.body instanceof import_node_stream.default)) {
      return Promise.resolve(Buffer.alloc(0));
    }
    const accum = [];
    let accumBytes = 0;
    let abort = false;
    return new Promise((resolve, reject) => {
      let resTimeout;
      if (this.timeout) {
        resTimeout = setTimeout(() => {
          abort = true;
          reject(
            new import_fetch_error.default(
              `Response timeout while trying to fetch ${this.url} (over ${this.timeout}ms)`,
              import_types.FetchErrorType.BodyTimeout
            )
          );
          this.body.emit("cancel-request");
        }, this.timeout);
      }
      this.body.on("error", (err) => {
        reject(
          new import_fetch_error.default(
            `Invalid response body while trying to fetch ${this.url}: ${err.message}`,
            import_types.FetchErrorType.System,
            err
          )
        );
      });
      this.body.on("data", (chunk) => {
        if (abort || chunk === null) {
          return;
        }
        if (this.size && accumBytes + chunk.length > this.size) {
          abort = true;
          reject(
            new import_fetch_error.default(
              `content size at ${this.url} over limit: ${this.size}`,
              import_types.FetchErrorType.MaxSize
            )
          );
          this.body.emit("cancel-request");
          return;
        }
        accumBytes += chunk.length;
        accum.push(chunk);
      });
      this.body.on("end", () => {
        if (abort) {
          return;
        }
        clearTimeout(resTimeout);
        resolve(Buffer.concat(accum));
      });
    });
  }
}
function convertBody(buffer, headers) {
  const ct = headers.get("content-type");
  let charset = "utf-8";
  let res = null;
  if (ct) {
    res = /charset=([^;]*)/i.exec(ct);
  }
  const str = buffer.subarray(0, 1024).toString();
  if (!res && str) {
    res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
  }
  if (!res && str) {
    res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(
      str
    );
    if (res) {
      const charsetMatch = res.pop();
      res = charsetMatch ? /charset=(.*)/i.exec(charsetMatch) : [];
    }
  }
  if (!res && str) {
    res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
  }
  if (res) {
    charset = res.pop() || "";
    if (charset === "gb2312" || charset === "gbk") {
      charset = "gb18030";
    }
  }
  return (0, import_common.convert)(buffer, "UTF-8", charset).toString();
}
//# sourceMappingURL=body.js.map
