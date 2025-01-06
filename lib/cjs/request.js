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
var request_exports = {};
__export(request_exports, {
  default: () => Request
});
module.exports = __toCommonJS(request_exports);
var import_node_url = require("node:url");
var import_common = require("./common.js");
var import_headers = __toESM(require("./headers.js"), 1);
var import_body = __toESM(require("./body.js"), 1);
class Request extends import_body.default {
  method;
  redirect;
  signal;
  chunkedEncoding;
  useElectronNet;
  useSessionCookies;
  follow;
  counter;
  session;
  constructor(input, init = {}) {
    let parsedURL;
    if (!(input instanceof Request)) {
      if (input && input.href) {
        parsedURL = (0, import_node_url.parse)(input.href);
      } else {
        parsedURL = (0, import_node_url.parse)(`${input}`);
      }
      input = {};
    } else {
      parsedURL = (0, import_node_url.parse)(input.url);
    }
    const method = init.method || input.method || "GET";
    if ((init.body != null || input instanceof Request && input.body !== null) && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init.body != null ? init.body : input instanceof Request && input.body !== null ? (0, import_common.clone)(input) : void 0;
    super(inputBody, {
      timeout: init.timeout || input.timeout || 0,
      size: init.size || input.size || 0
    });
    this.method = method.toUpperCase();
    this.redirect = init.redirect || input.redirect || "follow";
    this.signal = init.signal || input.signal || null;
    this.headers = new import_headers.default(init.headers || input.headers || {});
    this.headers.delete("Content-Length");
    this.chunkedEncoding = false;
    this.useElectronNet = init.useElectronNet !== void 0 ? init.useElectronNet : input.useElectronNet;
    if (this.useElectronNet && !process.versions.electron)
      throw new Error("Cannot use Electron/net module on Node.js!");
    if (this.useElectronNet === void 0) {
      this.useElectronNet = Boolean(process.versions.electron);
    }
    if (this.useElectronNet) {
      this.useSessionCookies = init.useSessionCookies !== void 0 ? init.useSessionCookies : input.useSessionCookies;
    }
    if (init.body != null) {
      const contentType = (0, import_common.extractContentType)(this);
      if (contentType !== null && !this.headers.has("Content-Type")) {
        this.headers.append("Content-Type", contentType);
      }
    }
    this.follow = init.follow !== void 0 ? init.follow : input.follow !== void 0 ? input.follow : 20;
    this.counter = init.counter || input.counter || 0;
    this.session = init.session || input.session;
    this.url = parsedURL;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Request",
      writable: false,
      enumerable: false,
      configurable: true
    });
  }
  set url(url) {
    this.url = url;
  }
  get url() {
    return (0, import_node_url.format)(this.url);
  }
  /**
   * Clone this request
   *
   * @return {Request}
   */
  clone() {
    return new Request(this);
  }
}
Object.defineProperty(Request.prototype, Symbol.toStringTag, {
  value: "RequestPrototype",
  writable: false,
  enumerable: false,
  configurable: true
});
//# sourceMappingURL=request.js.map
