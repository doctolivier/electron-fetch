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
export {
  FetchErrorType,
  netErrorMap
};
//# sourceMappingURL=types.js.map
