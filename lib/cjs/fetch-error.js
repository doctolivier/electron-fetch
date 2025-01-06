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
var fetch_error_exports = {};
__export(fetch_error_exports, {
  default: () => FetchError
});
module.exports = __toCommonJS(fetch_error_exports);
var import_types = require("./types.js");
class FetchError extends Error {
  message;
  type;
  code;
  errno;
  constructor(message, type, systemError) {
    super(message);
    const regex = /^.*net::(.*)/;
    if (regex.test(message)) {
      let errorCode = regex.exec(message)?.[1] || import_types.netErrorMap.ERR_UNKNOW;
      if (Object.prototype.hasOwnProperty.call(import_types.netErrorMap, errorCode))
        errorCode = import_types.netErrorMap[errorCode];
      systemError = { code: errorCode };
    }
    this.message = message;
    this.type = type;
    if (systemError) {
      this.code = this.errno = systemError.code;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
//# sourceMappingURL=fetch-error.js.map
