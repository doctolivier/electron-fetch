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
var response_exports = {};
__export(response_exports, {
  default: () => Response
});
module.exports = __toCommonJS(response_exports);
var import_http = require("http");
var import_common = require("./common.js");
var import_headers = __toESM(require("./headers.js"), 1);
var import_body = __toESM(require("./body.js"), 1);
class Response extends import_body.default {
  status;
  statusText;
  headers;
  useElectronNet;
  constructor(body, init = {}) {
    super(body, init);
    this.url = init.url || "";
    this.status = init.status || 200;
    this.statusText = init.statusText || import_http.STATUS_CODES[this.status];
    this.headers = new import_headers.default(
      init.headers ? init.headers : {}
    );
    this.useElectronNet = init.useElectronNet || false;
    Object.defineProperty(this, Symbol.toStringTag, {
      value: "Response",
      writable: false,
      enumerable: false,
      configurable: true
    });
  }
  /**
   * Convenience property representing if the request ended normally
   */
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  /**
   * Clone this response
   *
   * @return {Response}
   */
  clone() {
    return new Response((0, import_common.clone)(this), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      useElectronNet: this.useElectronNet
    });
  }
}
Object.defineProperty(Response.prototype, Symbol.toStringTag, {
  value: "ResponsePrototype",
  writable: false,
  enumerable: false,
  configurable: true
});
//# sourceMappingURL=response.js.map
