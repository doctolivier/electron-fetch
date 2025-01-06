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
var types_exports = {};
__export(types_exports, {
  FetchErrorType: () => FetchErrorType,
  netErrorMap: () => netErrorMap
});
module.exports = __toCommonJS(types_exports);
var FetchErrorType = /* @__PURE__ */ ((FetchErrorType2) => {
  FetchErrorType2["BodyTimeout"] = "body-timeout";
  FetchErrorType2["System"] = "system";
  FetchErrorType2["MaxSize"] = "max-size";
  FetchErrorType2["Abort"] = "abort";
  FetchErrorType2["RequestTimeout"] = "request-timeout";
  FetchErrorType2["Proxy"] = "proxy";
  FetchErrorType2["NoRedirect"] = "no-redirect";
  FetchErrorType2["MaxRedirect"] = "max-redirect";
  FetchErrorType2["InvalidRedirect"] = "invalid-redirect";
  return FetchErrorType2;
})(FetchErrorType || {});
const netErrorMap = {
  ERR_CONNECTION_REFUSED: "ECONNREFUSED",
  ERR_EMPTY_RESPONSE: "ECONNRESET",
  ERR_NAME_NOT_RESOLVED: "ENOTFOUND",
  ERR_CONTENT_DECODING_FAILED: "Z_DATA_ERROR",
  ERR_CONTENT_DECODING_INIT_FAILED: "Z_DATA_ERROR",
  ERR_UNKNOW: "UNKNOWN"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchErrorType,
  netErrorMap
});
//# sourceMappingURL=types.js.map
